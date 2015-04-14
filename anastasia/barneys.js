var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');

var fetchURL = require('./scraper_tools.js').fetchURL;
var upsert = require('./scraper_tools.js').upsert;

var BARNEYS = 'Barneys New York';
var BARNEYS_BASE_URL = 'http://www.barneys.com/barneys-new-york/women/shoes';
var parsedCount = 0;
var scrapedCount = 0;
var parseComplete = false;

/*
 * scrapeItemURLs()
 *
 * Description:
 * Given the HTML contents of a list results page, find all the URLs that correspond to
 * individual Barneys product items. Trigger individual scrapes for each set of product
 * items scraped.
 *
 */
var scrapeBarneysItemURLs = function(html) {
    $ = cheerio.load(html);
    var itemURLs = $('#search-result-items .thumb-link').map(function() {
        return $(this).attr('href');
    }).get();
    parsedCount += itemURLs.length;

    var fetchBarneysItem = function(url) {
        fetchURL(url, scrapeBarneysItem);
    };

    // Trigger async scrape for all the items
    async.each(itemURLs, fetchBarneysItem, function(err) {
        console.log("Couldn't fetch item: " + err);
    });

    // Recursively scrape the next page of item URLs until we've reached the end
    var nextPage = $('.pagination .page-next.active').attr('href');
    if (nextPage) {
        fetchURL(nextPage, scrapeBarneysItemURLs);
    } else {
        console.log("URL scraping complete: " + parsedCount + " shoe URLs scraped");
        parseComplete = true;
    }
};

/*
 * scrapeBarneysItem()
 *
 * Description:
 * Given the HTML contents of a Barneys product detail page, scrape the relevant contents
 * of the product and save the entry into MongoDB.
 *
 */
var scrapeBarneysItem = function(html) {
    $ = cheerio.load(html);

    var barneysItem = {
        retailer: BARNEYS,
        productId: $('meta[property="og:isbn"]').attr('content'),
        designer: $('#product-content .brand a').html(),
        productName: $('#product-content .product-name').html(),
        url: $('meta[property="og:url"]').attr('content'),
        price: $('meta[property="product:price:amount"]').attr('content'),
        priceCurrency: $('meta[property="product:price:currency"]').attr('content')
    };
    var details = $('#collapseOne .panel-body.standard-p').html();
    barneysItem.details = details ? details.trim() : '';

    barneysItem.images = [];
    $('#product-image-carousel .item').each(function() {
        var image = {
            url: $('.shoe', this).attr('src')
        };
        if ($('a', this).attr('data-index') === '0') {
            image.primary = true;
        }
        barneysItem.images.push(image);
    });

    upsert(barneysItem);
    scrapedCount++;
    if (parseComplete && scrapedCount === parsedCount) {
        console.log('All done');
        process.exit(0);
    }
};

var scrapeShoes = function() {
    fetchURL(BARNEYS_BASE_URL, scrapeBarneysItemURLs);
};
module.exports.scrapeShoes = scrapeShoes;