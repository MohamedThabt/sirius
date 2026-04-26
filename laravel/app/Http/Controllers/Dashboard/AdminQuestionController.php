<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminQuestionController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->has('questionnaireAnswers')
            ->withCount('questionnaireAnswers')
            ->withMax('questionnaireAnswers', 'created_at')
            ->orderByDesc('questionnaire_answers_max_created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/questions/index', [
            'users' => $users,
        ]);
    }

    public function show(User $user): Response
    {
        $answers = $user->questionnaireAnswers()
            ->orderBy('created_at')
            ->get(['id', 'question', 'answer', 'created_at']);

        return Inertia::render('admin/questions/show', [
            'user'    => $user->only('id', 'name', 'email'),
            'answers' => $answers,
        ]);
    }
}
