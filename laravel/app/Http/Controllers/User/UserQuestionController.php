<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\UserQuestionAnswer;
use App\Services\Notification\TelegramNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UserQuestionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('user/questionnaire');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'questionnaire' => 'nullable|array',
            'questionnaire.*.question' => 'required_with:questionnaire.*|string|max:1000',
            'questionnaire.*.answer' => 'nullable|string|max:2000',
        ]);

        $user = Auth::user();
        $saved = [];

        if ($request->has('questionnaire') && is_array($request->questionnaire)) {
            foreach ($request->questionnaire as $item) {
                if (empty(trim($item['answer'] ?? ''))) {
                    continue;
                }

                UserQuestionAnswer::updateOrCreate(
                    ['user_id' => $user->id, 'question' => $item['question']],
                    ['answer' => $item['answer']]
                );

                $saved[] = $item;
            }
        }

        if (!empty($saved)) {
            try {
                app(TelegramNotificationService::class)->notifyQuestionnaireSubmitted($user, $saved);
            } catch (\Throwable) {
            }
        }

        return redirect()->route('projects.index');
    }
}
