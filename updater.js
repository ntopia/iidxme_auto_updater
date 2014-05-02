
var page = require('webpage').create();
var config = require( "./config.json" );

var iidxme_login_data = null;
var iidxme_sha1pass = null;

function update_music_data()
{
	console.log( "start music data updating..." );
	page.evaluate( function() {

		/**** for PhantomJS's weird encoding processing ****/
		load = function(url) {
			var http = new XMLHttpRequest();
			http.open("GET", "http://p.eagate.573.jp/game/2dx/21/p/" + url, false);
			http.responseType = "arraybuffer";
			http.send();
			var r = new TextDecoder("shift_jis").decode(new Uint8Array(http.response));
			var e = false;
			if (r.indexOf("error_title") >= 0) {
				alert("error: maintenance?");
				e = true;
			} else if (r.indexOf("login") >= 0) {
				alert("error: please login");
				e = true;
			}
			if (e) {
				$("#iidxme").remove();
				throw "error";
			}
			return r;
		};
		loadPost = function(url, param) {
			var http = new XMLHttpRequest();
			http.open("POST", "http://p.eagate.573.jp/game/2dx/21/p/" + url, false);
			http.responseType = "arraybuffer";
			http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			http.send(param);
			return new TextDecoder("shift_jis").decode(new Uint8Array(http.response));
		};
		/**** end ****/

		$("input[name=rd-update][value=all]").attr("checked", true);
	//	$("input[name=rd-update]:checked").val();

		update();
	});

	/*	TODO:
		wait until update finished..
		but how..?? T_T
	*/
}

function update_basic_data()
{
	if ( page.injectJs( "./text-encoding/lib/encoding-indexes.js" ) !== true ) {
		console.log( "decoder script load failed.." );
		phantom.exit();
	}
	if ( page.injectJs( "./text-encoding/lib/encoding.js" ) !== true ) {
		console.log( "decoder script load failed.." );
		phantom.exit();
	}

	console.log( "start basic data updating..." );
	page.evaluate( function( iidxme_id, iidxme_sha1pass, iidx_djid ) {

		/**** for PhantomJS's weird encoding processing ****/
		load = function(url) {
			var http = new XMLHttpRequest();
			http.open("GET", "http://p.eagate.573.jp/game/2dx/21/p/" + url, false);
			http.responseType = "arraybuffer";
			http.send();
			var r = new TextDecoder("shift_jis").decode(new Uint8Array(http.response));
			var e = false;
			if (r.indexOf("error_title") >= 0) {
				alert("error: maintenance?");
				e = true;
			} else if (r.indexOf("login") >= 0) {
				alert("error: please login");
				e = true;
			}
			if (e) {
				$("#iidxme").remove();
				throw "error";
			}
			return r;
		};
		loadPost = function(url, param) {
			var http = new XMLHttpRequest();
			http.open("POST", "http://p.eagate.573.jp/game/2dx/21/p/" + url, false);
			http.responseType = "arraybuffer";
			http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			http.send(param);
			return new TextDecoder("shift_jis").decode(new Uint8Array(http.response));
		};
		/**** end ****/

		id = iidxme_id;
		pass = iidxme_sha1pass;
		iidxid = iidx_djid;

		$.getJSON("http://iidx.me/$/json/?data=init&callback=?", function(data) {
			$("body").html(data["html"] + $("body").html());
			mids = data["mids"];
		});
		getDjdata();
		getExtras();
	}, config["iidxme_id"], iidxme_sha1pass, iidxme_login_data["iidxid"]);

	setTimeout( function() {
	setTimeout( function() {
		console.log( "update basic data success" );
		update_music_data();
	}, 6000 );
	}, 1 );
}

function load_iidxme_script()
{
	page.includeJs( "http://iidx.me/update.js", function() {
		console.log( "iidxme script load success" );

		update_basic_data();
	});
}


function load_eamu_page()
{
	var eamu_login_data = encodeURI( "KID=" + config["eamu_id"] + "&pass=" + config["eamu_pass"] + "&OTP=" );
	page.open( "https://p.eagate.573.jp/gate/p/login.html", "POST", eamu_login_data, function( status ) {
		if ( status !== "success" ) {
			console.log( "error3" );
			phantom.exit();
		}

		console.log( "eamu login success" );
		page.open( "http://p.eagate.573.jp/game/2dx/21/p/djdata/status.html", function( status ) {
			if ( status !== "success" ) {
				console.log( "error4" );
				phantom.exit();
			}

			console.log( "status page load" );
			load_iidxme_script();
		});
	});
}

function load_iidxme_login_data()
{
	page.includeJs( "http://iidx.me/sha1.js", function() {
		var sha1pass = page.evaluate( function( pass ) {
			return CybozuLabs.SHA1.calc( pass );
		}, config["iidxme_pass"] );
		iidxme_sha1pass = sha1pass;

		page.open( "http://iidx.me/$/json/?data=login&id=" + config["iidxme_id"] + "&pass=" + iidxme_sha1pass, function( status ) {
			if ( status !== "success" ) {
				console.log( "error2" );
				phantom.exit();
			}

			iidxme_login_data = eval( page.plainText );
			if ( iidxme_login_data["result"] !== true ) {
				console.log( "iidxme login failed" );
				phantom.exit();
			}

			console.log( "iidxme login success" );
			load_eamu_page();
		});
	});
}

console.log( "start!" );
load_iidxme_login_data();
