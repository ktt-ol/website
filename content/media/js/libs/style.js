function switch_style(css_title) {
	$('link[rel~="stylesheet"][title]').prop('disabled', true);
	$('link[rel~="stylesheet"][title="'+css_title+'"]').prop('disabled', false);
	$.cookie("style", css_title, {expires: 365, path: '/'});
}
