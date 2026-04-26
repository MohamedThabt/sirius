<?php

namespace App\Support;

final class AuthEmail
{
    /**
     * Same as beta signup (rfc + dns) in real environments; RFC-only in testing so PHPUnit does not depend on DNS.
     */
    public static function laravelRule(): string
    {
        return app()->environment('testing') ? 'email:rfc' : 'email:rfc,dns';
    }
}
