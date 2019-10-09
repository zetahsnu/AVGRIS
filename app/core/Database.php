<?php

/**
 * Description of Database
 *
 * @author Minx
 */
class Database extends PDO {

    private $options = [
        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
    ];

    function __construct() {
        parent::__construct(DB_DSN, DB_USER, DB_PASSWORD, $this->options);
    }

}
