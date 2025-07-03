window._snapinsSnippetSettingsFile = ( function() {

    console.log( 
		"Code from Static Resource loaded" 
	);
    let name = sessionStorage.getItem(
		'LSKey[c]CurrentUserFullName',
	);
	let contactId = sessionStorage.getItem(
		'LSKey[c]CurrentUserContactId',
	);
	console.log(
		'Name is',
		name
	);
	console.log(
		'ContactId is',
		contactId
	);
	
	if ( name ) {
		
		embedded_svc.snippetSettingsFile.extraPrechatFormDetails  = [ { 
				"label" : "Name", 
				"value" : name,
				"transcriptFields" : ["Name__c"]
		},
		{ 
				"label" : "ContactId", 
				"value" : contactId,
				"transcriptFields" : ["ContactId"]
		}
		];
	
	}
	
}
)();