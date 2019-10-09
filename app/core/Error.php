<?php

namespace core;

class Error {

    private static $error_define = [
        404 => 'This Page doesn\'t exist.',
        1100 => 'Connect Database Error.',
        1200 => 'The record doesn\'t exist.'
    ];
    private static $errors = [];

    public static function setError($error_code = null) {
        self::$errors[] = is_numeric($error_code) ? self::$error_define[$error_code] : $error_code;
    }

    public static function getErrors() {
        return self::$errors;
    }

}
