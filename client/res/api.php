<?php
/**
 * api.php
 * -Chase DeLuca
 * 1/26/14
 *
 */

function doQuery($query) {
	$dbc = new mysqli('localhost','root','root','dfp');

	if (mysqli_connect_errno()) {
		printf("Connect failed: %s\n", mysqli_connect_error());
		exit();
	}

	$result = $dbc->query($query) or die($dbc->error.__LINE__);

	// GOING THROUGH THE DATA
	if($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			$all_rows[] = $row;
		}
	} else {
		$all_rows = false;
	}
	$dbc->close();
	return $all_rows;
}

function createVendorFromShortCode($shortCode) {
/* Input: shortcode
 * Output: error if exists, success if created
 *
	*/

	if(preg_match('/[^a-z0-9]/i', $shortCode)) {
		return [
			'error' => 'Not a valid Short Code.'
		];
	} else {

		$query = 'SELECT * FROM vendor where shortcode = "'.$shortCode.'"';
		if ($results = doQuery($query)) {
			//there were rows
			return [
				'error' => 'That short code has been taken.'
			];

		} else {
			//there were no rows
			$query = 'INSERT INTO vendor (shortcode) VALUES ("'.$shortCode.'")';
			doQuery($query);
			$results =	['success' => 'Vendor created for shortcode: '.$shortCode];
		}

		return $results;

	}


}

function getVendorInfoFromShortCode($shortCode) {
/* Input: shortcode
 * Output: error if NOT exists, array of vendor info if success
 *
	*/

	$query = 'SELECT ven.*,max(vis.pos) as `last_ticket`,
		ifnull((select max(pos) from visitor where
		vendor_id = ven.id and served = 1),0)+1 as `now_serving`
		FROM vendor ven	JOIN visitor vis ON (ven.id = vis.vendor_id)
		where shortcode = "'.$shortCode.'"';
	if ($results = doQuery($query)) {
		//there were rows
		$thisVenue = $results[0];
		$query = 'SELECT * FROM visitor where vendor_id = "'.$thisVenue['id'].'"';
		$results = doQuery($query);
			if ($results) {
				$visitorQueue = $results;
			} else {
				$visitorQueue = array();
			}
		$thisVenue['visitorQueue'] = $visitorQueue;
		return $thisVenue;


	} else {
		//there were no rows
		return [
			'error' => 'No vendor found for that shortcode.'
		];
	}


}

function markVisitorServed($shortCode,$pos) {
/* Input: shortcode, pos
 * Actions: mark the visitor served; send SMS to nums 2,1, and 0 away
 * Output: success/failure
	*/

	$query = 'SELECT id FROM vendor where shortcode = "'.$shortCode.'"';
	if ($results = doQuery($query)) {
		//there were rows
		$query = 'UPDATE visitor SET served = "1" where pos = "'.$pos.'" AND vendor_id = "'.$results[0]['id'].'"';
		doQuery($query);
		return ['success' => 'success'];

	} else {
		//there were no rows
		return [
			'error' => 'No vendor found for that shortcode.'
		];
	}



}

function createVisitorFromShortCode($shortCode,$ph_num) {
/* Input: shortcode, ph_num
 * Output:
 *      if ph_num exists and is not served, reply with msg about cur pos
 *      if ph_num no exists, or is served, add to list, and reply new pos
 *
	*/

	$query = 'SELECT ven.*,max(vis.pos) as `last_ticket`,
		ifnull((select max(pos) from visitor where
		vendor_id = ven.id and served = 1),0)+1 as `now_serving`
		FROM vendor ven	JOIN visitor vis ON (ven.id = vis.vendor_id)
		where shortcode = "'.$shortCode.'"';
	if ($results = doQuery($query)) {
		//there were rows
		$query = 'UPDATE visitor SET served = "1" where pos = "'.$pos.'" AND vendor_id = "'.$results[0]['id'].'"';
		doQuery($query);
		return ['success' => 'success'];

	} else {
		//there were no rows
		return [
			'error' => 'No vendor found for that shortcode.'
		];
	}




}


function sendSMStoUser($ph_num,$msg) {
/* Input: ph_num, message
 * Actions: send twilio message to ph_num
 * Output: success/failure
 *
	*/


}

$foo = markVisitorServed('happy',2);

echo "<pre>";
print_r($foo);
echo "\n\n";
//echo json_encode($foo);
echo "</pre>";

