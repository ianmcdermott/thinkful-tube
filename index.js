// 	====================================== * * * * * * VARIABLES * * * * * * ====================================== //

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
let userSearch = "";
let moreResultCount = 0;
let prevPage;
let nextPage;
let nextPageClicked = false;
let prevPageClicked = false;

// 	====================================== * * * * * * API FUNCTIONS * * * * * * ====================================== //

function getDataFromAPI(callback){
	let pageTokenState;
	if(nextPageClicked) pageTokenState = nextPage;
	else if(prevPageClicked) pageTokenState = prevPage;
	else pageTokenState = null;

	const query = {	
		q: userSearch,
		maxResults: 10,
		key: "AIzaSyCOQcmcGEmE5hwqB4Z1Pv8OXTsOE9yK06M",
		part: 'snippet',
		pageToken: pageTokenState
	}
	$.getJSON(YOUTUBE_SEARCH_URL, query, callback);
	nextPageClicked = false;
	prevPageClicked = false;
}

// 	====================================== * * * * * * RENDER FUNCTIONS * * * * * * ====================================== //

//renders search data to viewport
function renderResult(result){
	let linkId = "";
	
	//some results are channels, not videos so we make a variable that'll handle it if that's the case 
	if(result.id.kind === "youtube#video"){
		linkId = `https://www.youtube.com/watch?v=${result.id.videoId}`;
	} else if (result.id.kind === "youtube#channel"){
		linkId = `https://www.youtube.com/channel/${result.id.channelId}`;
	}

	// Render the HTML with thumbnail, link to more videos from user, and video popping up as iframe in a featherlight lightbox 
	return `
		<div class="search-results">
			<a href="https://www.youtube.com/embed/${result.id.videoId}" data-featherlight="iframe" data-featherlight-iframe-allowfullscreen="true" data-featherlight-iframe-width="750" data-featherlight-iframe-height="422" role="application"><img src="${result.snippet.thumbnails.medium.url}" alt="Image for ${result.snippet.title}. Click to open lightbox."/></a>
			<div class="image-description">
				<h2>
					<a href="https://www.youtube.com/embed/${result.id.videoId}" data-featherlight="iframe" data-featherlight-iframe-allowfullscreen="true" data-featherlight-iframe-width="750" data-featherlight-iframe-height="422" role="application">Click to open lightbox for ${result.snippet.title}</a>
				</h2>
				
				<a class="js-more-video" href="https://www.youtube.com/channel/${result.snippet.channelId}" target="blank">More from ${result.snippet.channelTitle}</a>
				
			</div>
		</div>
	`;
}

//puts each result through the render function
function displayYoutubeSearchData(data){
	const results = data.items.map((item, index) => renderResult(item));
	$(renderNavButtons(results, data));
	//Update Prev/Next Page variables to be added in Ajax query
	nextPage = data.nextPageToken;
	prevPage = data.prevPageToken;
}

//Updates the header with user search input
function updateSearchTitle(searchVal){
	$(".js-result-title").text(`Results for ${searchVal}`);	
}

//Renders Watch More/Prev buttons to webpage
function renderNavButtons(results, data){
	$(".js-search-results").html(results);
	$(".js-more-results-btn")
		.css({"display": "inline"})
		.prop("hidden", false);
	if(moreResultCount > 0){
		$(".js-prev-results-btn")
			.css({"display": "inline"})
			.prop("hidden", false);
	} else {
		$(".js-prev-results-btn")
			.css({"display": "none"})
			.prop("hidden", false);
	};
}

// 	====================================== * * * * * * EVENT HANDLERS * * * * * * ====================================== //

//listens for submit click
function watchSubmit(){
	$(".js-search-form").submit(event => {
		event.preventDefault();

		const queryTarget = $(event.currentTarget).find('.js-query');
    	userSearch = queryTarget.val();
		queryTarget.val("");
		//User's input is the query we send to our getDataFromAPI function, displayYoutubeSearchData is the callback function to be used with the input
		getDataFromAPI(displayYoutubeSearchData);
		updateSearchTitle(userSearch);
	})
}

//listens for "Show More Results" button click
function watchMoreResults(){
	$(".js-more-results").on("click", ".js-more-results-btn", event=> {
		event.stopPropagation();
		moreResultCount++;
		nextPageClicked = true;
		getDataFromAPI(displayYoutubeSearchData);
	});
}

//listens for "Show Prev Results" button click
function watchPrevResults(){
	$(".js-more-results").on("click", ".js-prev-results-btn", event=> {
		event.stopPropagation();
		moreResultCount--;
		prevPageClicked = true;
		getDataFromAPI(displayYoutubeSearchData);	
	});
}

function runApp(){
	$(watchSubmit);
	$(watchMoreResults);
	$(watchPrevResults);
}

$(runApp);