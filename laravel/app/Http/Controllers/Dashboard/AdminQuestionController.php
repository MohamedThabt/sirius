<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\UserQuestionAnswer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminQuestionController extends Controller
{
    /**
     * Display a listing of questionnaire answers.
     */
    public function index(Request $request)
    {
        $answers = UserQuestionAnswer::with('user:id,name,email')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/questions/index', [
            'answers' => $answers,
        ]);
    }

    /**
     * Display the specified user question and answer.
     */
    public function show(UserQuestionAnswer $question)
    {
        $question->load('user:id,name,email');

        return Inertia::render('admin/questions/show', [
            'question' => $question,
        ]);
    }
}
