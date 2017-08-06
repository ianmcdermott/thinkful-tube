const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
let userSearch = "";

function getDataFromAPI(searchTerm, callback){
	userSearch = searchTerm;
	const query = {	
		q: `${searchTerm}`,
		maxResults: 10,
		key: "AIzaSyCOQcmcGEmE5hwqB4Z1Pv8OXTsOE9yK06M",
		part: 'snippet',
	}
	//Somehow pass the query (search term) into the callback (displayYoutubeSearchData)

	$.getJSON(YOUTUBE_SEARCH_URL, query, callback);
	
}

function getNextPageFromAPI(callback, nextPage){

	const query = {	
		q: userSearch,
		maxResults: 10,
		key: "AIzaSyCOQcmcGEmE5hwqB4Z1Pv8OXTsOE9yK06M",
		part: 'snippet',
		pageToken: nextPage
	}
	console.log(nextPage);
	//put endpoint+query combo into displayYoutubeSearchData func
	$.getJSON(YOUTUBE_SEARCH_URL, query, callback);
}


//renders search data to 
function renderResult(result){

	let linkId = "";
	
	//some results are channels, not videos so we make a variable that'll handle it if that's the case 
	if(result.id.kind === "youtube#video"){
		linkId = `https://www.youtube.com/watch?v=${result.id.videoId}`;
	} else if (result.id.kind === "youtube#channel"){
		linkId = `https://www.youtube.com/channel/${result.id.channelId}`;
	}
	return `
		<div class="search-results">
			<a href="https://www.youtube.com/embed/${result.id.videoId}" data-featherlight="iframe" data-featherlight-iframe-allowfullscreen="true" data-featherlight-iframe-width="750" data-featherlight-iframe-height="422"><img src="${result.snippet.thumbnails.medium.url}" alt="Image for ${result.snippet.title}"/></a>
			<div class="image-description">
				<h2>
					<a class="js-result-name swipebox" href="#"></a>
				</h2>
				
				<a class="js-more-video" href="https://www.youtube.com/channel/${result.snippet.channelId}" target="blank">More from ${result.snippet.channelTitle}</a>
				
			</div>
		</div>
	`;

}

//puts each result through the render function
function displayYoutubeSearchData(data){
	console.log("Data is: " + data);
	const results = data.items.map((item, index) => renderResult(item));
	console.log("next page is: " + data.nextPageToken)
	$(watchMoreResults(data))
	//const nextPageToken = data.items.map((item, index) => item.nextPageToken);
	$(".js-search-results").html(results);
	$(".js-more-results").css({"display": "block"});
}


//listens for submit event
function watchSubmit(){
	$(".js-search-form").submit(event => {
		const queryTarget = $(event.currentTarget).find('.js-query');
    	const query = queryTarget.val();
		queryTarget.val("");
		//User's input is the query we send to our getData function, displayYoutubeSearchData is the callback function to be used with the input
		getDataFromAPI(query, displayYoutubeSearchData);
		updateSearchTitle(query);
	})
}

//listens for submit event
function watchMoreResults(data){

	$(".js-more-results").on("click", ".js-more-results-btn", event=> {
	//	$({result.nextPageToken});
	console.log("data q is " + data.nextPageToken);
	getNextPageFromAPI(displayYoutubeSearchData, data.nextPageToken);
	// Take the current next page token, and use it to get a new object of the next results
	});
	
}

function updateSearchTitle(searchVal){
	console.log(`Results for ${searchVal}`);
	$(".js-result-title").text(`Results for ${searchVal}`);	
}

$(watchSubmit);



/*	
    Make the images clickable, leading the user to the YouTube video, on YouTube
    Make the images clickable, playing them in a lightbox
    Show a link for more from the channel that each video came from
    Show buttons to get more results (using the previous and next page links from the JSON)
*/