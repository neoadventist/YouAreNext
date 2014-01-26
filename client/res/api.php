<?php
/**
 * api.php
 * -Chase DeLuca
 * 1/26/14
 *
 */

require_once $_SERVER['DOCUMENT_ROOT'].'/res/mysql.class.php';

function createVendorFromShortCode($shortCode) {
/* Input: shortcode
 * Output: error if exists, success if created
 *
	*/

//	if(preg_match('/[^a-zA-B0-9]/i', $shortCode))
//	{
//		return [
//			'error' => 'Not a valid Short Code.'
//		];
//	}

	$dbc = new mysqli('localhost','root','root','dfp');
	$result = $dbc->query('SELECT * from vendor;');
	$foo = mysql_fetch_array($result);
	print_r($foo);

}

function getVendorInfoFromShortCode($shortCode) {
/* Input: shortcode
 * Output: error if NOT exists, array of vendor info if success
 *
	*/

}

function markVisitorServed($shortCode,$pos) {
/* Input: shortcode, pos
 * Actions: mark the visitor served; send SMS to nums 2,1, and 0 away
 * Output: success/failure
	*/


}

function createVisitorFromShortCode($shortCode,$ph_num) {
/* Input: shortcode, ph_num
 * Output:
 *      if ph_num exists and is not served, reply with msg about cur pos
 *      if ph_num no exists, or is served, add to list, and reply new pos
 *
	*/
}


function sendSMStoUser($ph_num,$msg) {
/* Input: ph_num, message
 * Actions: send twilio message to ph_num
 * Output: success/failure
 *
	*/


}

createVendorFromShortCode('happy');