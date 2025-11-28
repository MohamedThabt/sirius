<?php

namespace App\Exceptions;

use App\Traits\StructuredLogger;
use BadMethodCallException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use LogicException;
use PDOException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Inertia\Inertia;
use Throwable;

class Handler extends ExceptionHandler
{
    use StructuredLogger;

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Report or log an exception.
     *
     * @param  \Throwable  $e
     * @return void
     *
     * @throws \Throwable
     */
    public function report(Throwable $e)
    {
        if ($this->shouldntReport($e)) {
            return;
        }

        // Use the StructuredLogger trait to log the exception
        $this->logException($e);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $e
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $e)
    {
        // Maintain default Laravel validation behavior
        if ($e instanceof ValidationException) {
            return parent::render($request, $e);
        }

        // Handle 404 errors by rendering the Error page
        if ($e instanceof NotFoundHttpException || $e instanceof ModelNotFoundException) {
            return Inertia::render('Error', [
                'status' => 404,
                'message' => 'The page you are looking for could not be found.',
            ])->toResponse($request)->setStatusCode(404);
        }

        // Handle specific exceptions with friendly messages
        $message = $this->getFriendlyMessage($e);

        if ($message) {
            // Return back with error flash message for Inertia/Frontend
            return back()->with('error', $message);
        }

        // Default behavior for other exceptions (or if no friendly message defined)
        // In production, we might want to catch everything else as 500
        if ($this->isHttpException($e) && $e->getStatusCode() === 500) {
             return back()->with('error', 'A server error occurred. Please try again later.');
        }
        
        // Handle unexpected exceptions that are not specifically caught above but fell through
        // Catch ALL unexpected exceptions and show a toast:
        return back()->with('error', 'An unexpected error occurred. Please try again later.');
    }

    /**
     * Get a friendly message for the exception if handled.
     *
     * @param Throwable $e
     * @return string|null
     */
    protected function getFriendlyMessage(Throwable $e): ?string
    {
        // 404s are handled in render() now

        if ($e instanceof QueryException || $e instanceof PDOException) {
            return 'A connection error occurred. Please try again later.';
        }

        if ($e instanceof BadMethodCallException) {
            return 'Invalid operation requested.';
        }

        if ($e instanceof LogicException) {
            return 'A system logic error occurred.';
        }

        return null;
    }
}
