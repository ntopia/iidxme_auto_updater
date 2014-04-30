
var page = require('webpage').create();
var config = require( "./config.json" );

console.log( "start!" );
page.open( "http://iidx.me/$/json/?data=init", function( status ) {
	if ( status !== "success" ) {
		console.log( "error1" );
		phantom.exit();
	}
	console.log( "init data load" );

	var init_data = eval( page.plainText );
	var mids = init_data["mids"];

	page.includeJs( "http://iidx.me/sha1.js", function() {
		var sha1pass = page.evaluate( function( iidxme_pass ) {
			return CybozuLabs.SHA1.calc( iidxme_pass );
		}, config["iidxme_pass"] );

		page.open( "http://iidx.me/$/json/?data=login&id=" + config["iidxme_id"] + "&pass=" + sha1pass, function( status ) {
			if ( status !== "success" ) {
				console.log( "error2" );
				phantom.exit();
			}

			var login_data = eval( page.plainText );
			console.log( "iidxme login result : " + login_data["result"] );

			eamu_login_data = encodeURI( "KID=" + config["eamu_id"] + "&pass=" + config["eamu_pass"] + "&OTP=" );
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

					page.includeJs( "http://iidx.me/update.js", function() {

						var p = page.evaluate( function( sha1password ) {
							id = "vvvvvv";
							pass = sha1password
							iidxid = "25750625";
							//getDjdata();
							return 3;
						}, sha1pass);

						phantom.exit();
					});
				});
			});
		});
	});
});
