<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserQuestionAnswer;
use Illuminate\Support\Facades\Auth;

class UserQuestionController extends Controller
{
    /**
     * Store or update user questions and answers.
     */
    public function store(Request $request)
    {
        $request->validate([
            'questionnaire' => 'required|array',
            'questionnaire.*.question' => 'required|string|max:1000',
            'questionnaire.*.answer' => 'required|string|max:2000',
        ]);

        $user = Auth::user();

        // Upsert the answers for the user
        foreach ($request->questionnaire as $item) {
            UserQuestionAnswer::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'question' => $item['question'],
                ],
                [
                    'answer' => $item['answer'],
                ]
            );
        }

        return back()->with('success', 'Questionnaire submitted successfully.');
    }
}
