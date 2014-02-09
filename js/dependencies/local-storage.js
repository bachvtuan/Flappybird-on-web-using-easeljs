// HTML5 local storage access functionality w/ cookie fallback for JavaScript. Part of mmvc library, http://code.google.com/p/mmvc/
// Dependencies: None

/**
 * Sets cookie. This is used as fallback for setLocal.
 * @param name Name of the cookie
 * @param value Value of the cookie. Only strings accepted.
 * @param minutes Minutes of cookie validity. Pass 0 to make a cookie valid for this session. Pass -1 to remove the cookie.
 */
function setCookie( name, value, minutes )
{
	var expires = "";
	if ( minutes != 0 )
	{
		var date = new Date();
		date.setTime( date.getTime() + (minutes*60*1000) );
		expires = "; expires="+date.toGMTString();
	}
	document.cookie = name+"="+value+expires+"; path=/";
}

/**
 * Returns cookie value by name. This is used as fallback for getLocal.
 * @param name Cookie name
 * @return Cookie value string or null if cookie was not set.
 */
function getCookie( name ) 
{
	var name_eq = name + "=";
	var ca = document.cookie.split(';');
	
	for( var i = 0 ; i < ca.length ; ++i )
	{
		var c = ca[i];
		while ( c.charAt(0)==' ' ) 
			c = c.substring( 1, c.length );
		if ( c.indexOf(name_eq) == 0 ) 
			return c.substring( name_eq.length, c.length );
	}
	return null;
}

/**
 * Removes a cookie. This is used as fallback for eraseLocal.
 * @param name Cookie name
 */
function eraseCookie(name) 
{
	setCookie(name,"",-1);
}

/** 
 * Sets key-value pair in local storage.
 * @param key Key name
 * @param value Value. Can be any type (encoded to JSON)
 */
function setLocal( key, value )
{
	value = JSON.stringify(value);
	if ( typeof(localStorage) == 'undefined' )
	{
		setCookie( key, value, 0 );
	}
	else
	{
		localStorage.setItem( key, value );
	}
}

/** 
 * Erases value from local storage. 
 * @param key Key name
 */
function eraseLocal( key )
{
	if ( typeof(localStorage) == 'undefined' )
	{
		eraseCookie( key );
	}
	else
	{
		localStorage.removeItem( key );
	}
}

/** 
 * Returns value from local storage or null if not exist. 
 * @param key Key name
 */
function getLocal( key )
{
	if ( typeof(localStorage) == 'undefined' )
	{
		value = getCookie( key );
	}
	else
	{
		value = localStorage.getItem( key );
	}
	return JSON.parse(value);
}
