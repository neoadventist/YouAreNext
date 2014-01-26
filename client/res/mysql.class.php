<?php
	/*
	 *  Slingr MYSQL Class
	 *  Fernando Vasquez
	 *
	 *  Create Instance
	 *  $mysqli = new mySQL();
	 *
	 *  Set Query
	 *  $q = 'SELECT * FROM table WHERE col = ? LIMIT 5'
	 *
	 *  Exec Query
	 *  $results = $this->mysqli->run($q, array($var), 's');
	 *
	 *  RUN() returns ARRAY of RESULTS
	 *  foreach ($results as $each_result){
	 *      echo $each_result['col'];
	 *  }
	 *
	 *  Where as fetch returns each result at a time
	 *  foreach ($result = $mysqli->($q)){
	 *      echo $result['col'];
	 *  }
	 *
	*/

	class mySQL {
		// Base variables
		private $hostname;	            // MySQL Hostname
		private $username;	            // MySQL Username
		private $password;	            // MySQL Password
		private $database;	            // MySQL Database

		private $results_ptr;
		private $results;

		/** @var  mysqli $mysqli */
		private $mysqli;       		    // Database Connection Link

		public $count;
		public $num_rows;
		public $error;
		public $query;
		public $insert_id;

		/* *******************
		 * Class Constructor *
		 * *******************/

		function __construct($database = null, $username = null, $password = null, $hostname = null){
			$this->database = $database ?: DB_NAME;
			$this->username = $username ?: DB_USER;
			$this->password = $password ?: DB_PASSWORD;
			$this->hostname = $hostname ?: DB_HOST;

			return $this->connect();
		}

		/* *******************
		 * Public Functions *
		 * *******************/

		function insert_id(){
			return $this->insert_id ?: $this->mysqli->insert_id;
		}

		function close(){
			$this->mysqli->close();
		}

		function get_db_conn(){
			return $this->mysqli;
		}

		function set_error($log = ''){
			$this->error = $this->mysqli->error;

			if($log){
				logEvent($log.': '.$this->query.' -> '.$this->error);
			}
		}

		function query_execute($stmt){
			$this->results_ptr =   0;
			$this->results     =   '';

			if(is_object($stmt)){
				if(!$stmt->execute()){
					$this->set_error('Error Executing mySQL statement');
				}
				return true;
			}else{
				$this->set_error('Error Executing mySQL statement');
			}
			return false;
		}

		function fetch($sql = null, $params = null, $types = null){

			if(!$this->results){
				$this->run($sql, $params, $types);
			}

			$result = $this->results[$this->results_ptr];
			$this->results_ptr++;

			return $result;
		}

		function run($sql, $params = null, $types = null){

			// create a prepared statement
			$stmt           = $this->mysqli->prepare($sql);
			$bind_params    = array();
			$results        = array();

			$this->query = $sql;

			if(!$stmt){
				$this->set_error('Invalid SQL Statement prepare:');
				return false;
			}

			if($types && $params){
				// Add or Trim Type String to Fit
				$add = count($params) - strlen($types);
				if($add >= 0){
					$types .= str_repeat('b', $add);
				}else{
					$types = substr($types, 0, count($params));
				}

				$bind_names[] = $types;
				for($i = 0; $i < count($params); $i++){
					$bind_name    = 'bind'.$i;
					$$bind_name   = $params[$i];
					$bind_names[] = &$$bind_name;
				}
				call_user_func_array(array($stmt, 'bind_param'), $bind_names);
			}

			// execute query
			if($this->query_execute($stmt)){
				$result = array();
				$meta   = $stmt->result_metadata();

				if($meta){
					while($field = $meta->fetch_field()){
						$var                      = $field->name;
						$$var                     = null;
						$bind_params[$field->name] = & $$var;
					}

					call_user_func_array(array($stmt, 'bind_result'), $bind_params);

					while($stmt->fetch()){
						foreach($bind_params as $each_var_name=>$each_var_value){
							$result[$each_var_name] = $each_var_value;
						}
						array_push($results,$result);
					}
					$this->results  =   $results;
					$this->count    =   $this->num_rows =   sizeof($results);
					$stmt->close();
					return $results;
				}else{
					// This Query does not return a result. (e.g., UPDATE, INSERT)
					$this->insert_id = $this->mysqli->insert_id;
					$stmt->close();
					return true;
				}

			}else{
				$this->set_error('MYSQL Class Error');
				return false;
			}
		}




		/* *******************
		 * Private Functions *
		 * *******************/

		private function connect(){

			// Connect to DataBase. Ironically try to log error...
			$mysqli = new mysqli($this->hostname, $this->username, $this->password, $this->database)
								or die( logEvent( 'mySQL Class Connect Error: '.mysqli_connect_errno() ) );

			// Check if Connection is successful. Ironically log error...
			if ($mysqli->connect_errno) {
				logEvent( 'mySQL Class Connect Error: '.mysqli_connect_errno());
				exit();
			}

			// Connection Successful, Set Up Class
			$this->mysqli = $mysqli;
			$this->mysqli->set_charset('utf8');

			return $this->mysqli;
		}

	}
?>