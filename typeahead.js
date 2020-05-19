typeaheadHistory = {
	//create storage array
	storageArray: [],
	user: '',

	setUser: function() {
		if( isEmpty( page_variables.UserId ) ) {
			this.user = 'searchHistory';
		} else {
			this.user = page_variables.UserId;
		}
	},
	
	//utility functions that interact with local storage
	checkStorage: function() {
		if (typeof(Storage)!=="undefined") {
			this.setUser();
			return true;	
		} else {
			console.log('No Web Storage Support, please upgrade your browser to use Grainger.com (and the rest of the internet) to its fullest.');
		}
	},

	pullStorage: function (){
		if( this.checkStorage() ) {
			if( localStorage.getItem( this.user ) ) {
				this.storageArray = JSON.parse( localStorage.getItem( this.user ) );
			} else if ( isNotEmpty( localStorage.getItem('searchHistory') ) ) {
				this.storageArray = JSON.parse( localStorage.getItem( 'searchHistory' ) );
			}
		} 
	},

	resetStorage: function() {
		localStorage.setItem( this.user, '[]' );
		this.pullStorage();
	},

	unshiftInput: function(inputValue){
		var inputValue = inputValue.toLowerCase(),
			newItem = {
				selectedText: inputValue
			};

		for ( var i=0; i<this.storageArray.length; i++) {
			if ( this.storageArray[i].selectedText === inputValue ) {
				this.storageArray.splice(i, 1);
			}
		}

		this.storageArray.unshift( newItem );
		this.saveStorage();
	},

	saveStorage: function(){
		var storageString;

		//changes the value stored - currently 20
		this.storageArray = this.storageArray.slice(0,20);
		storageString = JSON.stringify( this.storageArray );
		localStorage.setItem( this.user, storageString );
	}
};


typeaheadFlyout = {
	openFlyout: function( item ) {
		var itemData = this.formatCall(item),
			menu = item.parents('ul'),
			flyout = item.parents('li').siblings('.flyout');
		
		// open flyout if closed
		if ( flyout.hasClass('hide') ){
			menu.addClass('search-results');
			flyout.removeClass('hide');
		}

		// call data
		this.callObject( itemData, flyout );
	},

	formatCall: function( item ) {
		var type = item.attr('data-url').split('&suggestConfigId='),
			url = item.attr('data-childkey'),
			categoryID = type[1],
			
			source = item.attr('title').split(' > '),
			title = source[source.length-1],
			parent = (source.length > 1 ? source.splice( 0, source.length-1 ).join(' <span class="separator"></span> ') : null);

			url = url.replace('/','|');
			
		switch ( Number( categoryID ) ) {
			case 2:  
				url = '/tac/'+url;
				break;
			case 4:  
				url = '/tab/'+url;
				break;
			default: 
				url = url;
				break;
		}

		return {url:url, dataURL:type[0], categoryID:categoryID, title:title, parent:parent}
	},

	callObject: function( itemData, target ) {
		var that = this,
			ajaxCall;

		if( ajaxCall ) {
			ajaxCall.abort();
		}
		
		var url = itemData.url;

		//display loader
		this.displayLoader(target);		

		ajaxCall = jQuery.ajax({
			url: url,
			type: 'GET',
			cache: true,
			success: function(data) {
				
				that.fillTemplate( data, itemData, target );
			},

			error: function(){
				that.fillTemplate( null, itemData, target );
			}

		});
	},

	displayLoader: function( target ) {
		target.append('<div class="loader"></div>');
	},

	fillTemplate: function(data, itemData, target) {
		//define context
		var context = {
			title: itemData.title.toLowerCase(),
			parent: (isNotEmpty(itemData.parent) ? itemData.parent.toLowerCase(): null),
			dataURL: itemData.dataURL,
			content: (isNotEmpty(data) ? data.seoContent : null),
			icon: (isNotEmpty( data ) && isNotEmpty( data.icon ) ? data.icon.split('.', 1): null),
			isSpanish: Grainger.isSpanish
		}

		if ( itemData.categoryID == 2 ) {
			context.dataURL += '&suggestConfigId=3';
			jQuery(target).html(Grainger.templates.categoryFlyout(context));
		} else if ( itemData.categoryID == 4 ) {
			context.dataURL += '&suggestConfigId=5';
			jQuery(target).html(Grainger.templates.brandFlyout(context));
		}

		// reenable flyout anchor clicks canceled by TAs initial prevent default
		target.find('a').each( function(){
			jQuery(this).on( 'click', function() {
				window.location.href = jQuery(this).attr('href');
			});
		});

	}
};