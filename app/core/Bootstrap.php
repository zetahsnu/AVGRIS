<?php

use core\Error as Errors;

class Bootstrap {

    private $controller = 'index';
    private $method = 'index';
    private $params = [];

    function __construct() {
        $url = $this->parseUrl();

        if (isset($url[0])) {
            if (file_exists(__DIR__ . '/../controllers/' . $url[0] . '.php') && $url[0] !== 'error') {
                $this->controller = $url[0];
            } else {
                $this->controller = 'error';
                Errors::setError(404);
            }
            unset($url[0]);
        }

        require_once __DIR__ . '/../controllers/' . $this->controller . '.php';

        $this->controller = new $this->controller();

        if (isset($url[1])) {
            if (method_exists($this->controller, $url[1])) {
                $this->method = $url[1];
            }
            unset($url[1]);
        }

        $this->params = $url ? array_values($url) : [];

        call_user_func_array([$this->controller, $this->method], $this->params);
    }

    function parseUrl() {
        if (filter_has_var(INPUT_GET, 'url')) {
            return $url = explode('/', filter_var(trim($_GET['url'], '/'), FILTER_SANITIZE_URL));
        }
    }

}
