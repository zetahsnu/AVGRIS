<?php

/**
 * Description of Session
 *
 * @author Minx
 */
class Session {

    public static function init() {
        session_start();
    }

    public static function set($key, $value) {
        $_SESSION[$key] = $value;
    }

    public static function get($key) {
        if (isset($_SESSION[$key])) {
            return $_SESSION[$key];
        }
        
        return false;
    }

    public static function destroy() {
        //unset($_SESSION);
        session_destroy();
    }

}
