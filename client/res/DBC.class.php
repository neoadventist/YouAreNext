<?php
	require_once $_SERVER['DOCUMENT_ROOT'].'/res/config.inc.php';

	/* PDO Wrapper by Fernando Vasquez
	 * Based off of http://www.imavex.com/php-pdo-wrapper-class/
	 *
	 * Usage:
	 *      $db = new DBC();
	 *      $db->prepare('SELECT * FROM transactions');
	 *      $results = $db->fetchAll();
	 *
	 *      echo "Took ".$db->getTimer().' sec';
	 *      echo "<pre>"; print_r($results); echo "</pre>";
	 *
	 */

	//  Leaving this Here as we don't need to carry
	//  this data around the whole site.
	define ('DB_PDO_TYPE', 'mysql');

	class DBC extends PDO{
		private $database;
		private $username;
		private $password;
		private $hostname;

		private $sql;
		private $binds  = array();

		/** @var PDOStatement $stmt */
		private $stmt;

		private $dbtype;
		private $options;
		private $dsn;

		private $startTime;
		private $timer = 0;

		public function __construct($params = array()){
			if(!is_array($params)){
				logEvent(__CLASS__.': Parameters Not an Array');
				return false;
			}

			// Set Variables
			$this->database = $params['database'] ?: 'dfp';
			$this->username = $params['username'] ?: 'root';
			$this->password = $params['password'] ?: 'root';
			$this->hostname = $params['hostname'] ?: 'localhost';
			$this->dbtype   = $params['dbtype']   ? strtolower($params['dbtype']) : DB_PDO_TYPE;
			$this->options  = $params['options']  ?: array(
				PDO::ATTR_PERSISTENT => FALSE,
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			);

			// Set DSN from settings above.
			$this->setDSN();

			// Try Initializing the Real PDO Class
			try {
				parent::__construct($this->dsn, $this->username, $this->password, $this->options);
			} catch (PDOException $e) {
				logEvent('PDO Error: '.$e->getMessage(), FATAL);
				return false;
			}
		}


		private function setDSN(){
			// Prepare DB Type
			switch ($this->dbtype){
				default:
				case ('pdo_mysql'):
				case ('mysql'):
					$this->dsn = 'mysql:host='.$this->hostname.';charset=utf8;dbname='.$this->database;
					break;
				case ('mssql'):
					$this->dsn = 'mssql:host='.$this->hostname.';dbname='.$this->database;
					break;
				case ('sybase'):
					$this->dsn = 'sybase:host='.$this->hostname.';dbname='.$this->database;
					break;
				case ('sqlite'):
					$this->dsn = 'sqlite:my/database/path/'.$this->database.'.db';
					break;
			}
		}

		private function logError($error){
			$sql     =  "SQL: '{$this->sql}''";
			$binds   =  $this->binds ? 'Binds: '. json_encode($this->binds) : '';
			$errors  =  'Error: '.$error;

			// Log Event
			logEvent("PDO Error: ".$this->debug()." {$errors}", ERROR);
		}

		public function prepare($query, array $binds = null){

			// Clear Stored SQL and Binds
			$this->sql      = $query;
			$this->binds    = array();
			$this->timer    = 0;
			$this->stmt     = NULL;

			// Prepare Statement
			$this->stmt = parent::prepare($this->sql);

			if(!$this->stmt){
				$this->logError(__METHOD__.': '.implode(":", parent::errorInfo() ), ERROR);
				return false;
			}

			// If Binds are Included, Run Bind.
			$this->bindArray($binds);

			// Return Statement
			return $this->stmt;
		}

		public function bindArray($binds){
			if(is_array($binds)){
				foreach($binds as $param => $value){
					$this->bind($param, $value);
				}
			}
		}

		public function bindRaw($param, $value, $type = null){
			return $this->doBind($param, $value, $type);
		}

		public function bindTags($param, $value, $type = null){
			// Clean Bind
			$value = trim($value);
			return $this->doBind($param, $value, $type);
		}

		public function bind($param, $value, $type = null){
			// Clean Bind
			$value = trim(strip_tags($value));
			return $this->doBind($param, $value, $type);
		}

		private function doBind($param, $value, $type = null){
			if (is_null($type)) {
				switch (true) {
					case is_int($value):
						$type = PDO::PARAM_INT;
						break;
					case is_bool($value):
						$type = PDO::PARAM_BOOL;
						break;
					case is_null($value):
						$type = PDO::PARAM_NULL;
						break;
					default:
						$type = PDO::PARAM_STR;
				}
			}

			try{
				$this->binds[] = [$param => $value];
				$this->stmt->bindValue($param, $value, $type);
				return true;
			}catch (PDOException $e){
				$this->logError(__METHOD__.': '.$e->getMessage(), ERROR);
				return false;
			}
		}
		private function startTimer(){
			// Start Timer
			$this->startTime = microtime(true);
		}

		private function endTimer(){
			// Stop and Store Timer
			$this->timer = microtime(true) - $this->startTime;

			// Check Timer
			$this->checkTimer();
		}

		private function checkTimer(){
			// Log if this took more than a second.
			if($this->getTimer() >= 1){
				logEvent('Query Took '.$this->getTimer(). ' sec to complete: '.$this->debug(), WARN);
			}
		}

		public function getTimer(){
			return $this->timer;
		}

		public function execute(){
			try{
				// Start Timer
				$this->startTimer();

				// Run Query Execution
				if(!$this->stmt->execute()){
					$this->logError(__METHOD__.': '.implode(":",$this->stmt->errorInfo()), ERROR);
					return false;
				}

				// End Timer
				$this->endTimer();

			}catch (PDOException $e){
				$this->logError(__METHOD__.': '.$e->getMessage(), ERROR);
				return false;
			}

			return true;
		}

		/**
		 * @param int $mode Optional Mode Type
		 * @return array|bool
		 */
		public function fetchAll($mode = PDO::FETCH_ASSOC){
			try{
				if(!$this->execute()){
					return false;
				}
				return $this->stmt->fetchAll($mode);
			}catch (PDOException $e){
				echo ($e->getMessage());
				return false;
			}
		}

		public function fetch($mode = PDO::FETCH_ASSOC, $class = null){
			try{
				if(!$this->execute()){
					return false;
				}
				return $this->stmt->fetch($mode);
			}catch (PDOException $e){
				echo ($e->getMessage());
			}
			return false;
		}

		public function rowCount(){
			return $this->stmt->rowCount();
		}

		public function debugDumpParams(){
			return $this->stmt->debugDumpParams();
		}

		public function debug($print = false){
			$sql = $this->sql;
			foreach($this->binds as $eachBind){
				foreach($eachBind as $param => $val){
					$sql = str_replace($param, "'".$val."'", $sql);
					$sql = str_replace(':'.$param, "'".$val."'", $sql);
				}
			}

			if($print){
				echo $sql;
			}else{
				logEvent($sql);
			}

			return $sql;
		}
	}