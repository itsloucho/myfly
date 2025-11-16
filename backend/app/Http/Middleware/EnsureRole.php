<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * Usage: ->middleware('role:agency_admin,admin')
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            abort(401);
        }

        if (empty($roles)) {
            return $next($request);
        }

        if (!$user->hasRole(...$roles)) {
            abort(403, 'Forbidden');
        }

        return $next($request);
    }
}


