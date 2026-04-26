<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Notification\TelegramNotificationService;
use App\Support\AppLogger;
use App\Support\AuthEmail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    use \App\Traits\StructuredLogger;
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $request->merge([
                'email' => $request->string('email')->lower()->toString(),
            ]);

            $rules = [
                'name' => 'required|string|max:255',
                'email' => ['required', 'string', 'lowercase', AuthEmail::laravelRule(), 'max:255', Rule::unique(User::class)],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'questionnaire' => 'nullable|array',
                'questionnaire.*.question' => 'required_with:questionnaire|string|max:1000',
                'questionnaire.*.answer' => 'required_with:questionnaire|string|max:2000',
            ];

            if (config('services.turnstile.secret_key')) {
                $rules['cf-turnstile-response'] = ['required', 'string'];
            }

            $messages = [
                'cf-turnstile-response.required' => 'Please complete the captcha verification.',
            ];

            $request->validate($rules, $messages);

            if (config('services.turnstile.secret_key')) {
                $cfResponse = \Illuminate\Support\Facades\Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                    'secret' => config('services.turnstile.secret_key'),
                    'response' => $request->input('cf-turnstile-response'),
                    'remoteip' => $request->ip(),
                ]);

                if (! $cfResponse->json('success')) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'cf-turnstile-response' => __('Failed captcha verification. Please try again.'),
                    ]);
                }
            }

            $user = \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);

                if ($request->has('questionnaire') && is_array($request->questionnaire)) {
                    $answers = collect($request->questionnaire)->map(function ($item) {
                        return [
                            'question' => $item['question'],
                            'answer' => $item['answer'],
                        ];
                    })->toArray();

                    $user->questionnaireAnswers()->createMany($answers);
                }

                return $user;
            });

            event(new Registered($user));

            Auth::login($user);

            AppLogger::security('user.registered', [
                'user_id' => $user->id,
                'email' => $user->email,
            ], 'info');

            try {
                app(TelegramNotificationService::class)->notifyNewUserRegistration($user);
            } catch (\Throwable $e) {
                $this->logException($e, ['action' => 'telegram_notification', 'user_id' => $user->id]);
            }

            return redirect()->route('user.questionnaire.create');
        } catch (\Throwable $e) {
            $this->logException($e, ['action' => 'register']);
            throw $e;
        }
    }
}
