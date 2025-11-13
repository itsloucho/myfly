<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();
        
        // Extract subdomain
        $parts = explode('.', $host);
        
        // If running locally (localhost), check for subdomain format like agency1.localhost
        if (count($parts) >= 2) {
            $subdomain = $parts[0];
            
            // Skip if subdomain is www or the main domain
            if ($subdomain !== 'www' && $subdomain !== 'localhost' && $subdomain !== '127') {
                $tenant = Tenant::where('slug', $subdomain)->first();
                
                if ($tenant) {
                    // Store tenant in request
                    $request->attributes->set('tenant', $tenant);
                    $request->merge(['tenant_id' => $tenant->id]);
                }
            }
        }

        return $next($request);
    }
}
