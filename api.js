var express = require('express');
var https = require('https');
var parser = require('cheerio');
var router = express.Router();

router.get('/api/searchmusic/:music', function (req, res, next) {
  https.get('https://search.roblox.com/catalog/json?Category=9&Keyword=' + encodeURI(req.params.music), function (search) {
    search.pipe(res);
  });
});

//router.get('/api/asset/:id', function (req, res, next) {
//  https.get('https://assetdelivery.roblox.com/v1/asset/?id=' + encodeURI(req.params.id), function (search) {
 //   search.pipe(res);
//  });
//});
router.get('/assets/:id', async (req, res) => {
    let id = req.params?.id
    if(!id) {
        return res.status(403).json({ error: "Did not provide asset id", })
    }

    try {
        id = encodeURIComponent(id)
        const response = await axios.get(`https://assetdelivery.roblox.com/v1/asset?id=${id}`)
        return res
            .status(response.status)
            .header(response.headers)
            .send(response.data)
    } catch (ex) {
        return res.status(500).json({ error: 'Error occured while making asset request', message: ex.message })
    }
})

router.get('/api/usernames/:userId*?', function (req, res, next) {
  var userId = req.params.userId || req.query.userId;
  if (!userId) {
    res.end('Parameter userId is required.');
    return;
  }
  https.get('https://www.roblox.com/users/' + encodeURI(userId) + '/profile', function (user) {
    if (user.statusCode !== 200) {
      res.end('Request failed, make sure the userId is valid');
    }

    var raw = '';
    user.on('data', function (chunk) {
      raw += chunk;
    });

    user.on('end', function () {
      var $ = parser.load(raw);
      var past = $('.tooltip-pastnames');
      var names = [];
      if (past.length > 0) {
        names = past.attr('title').split(', ');
      }
      names.unshift($('.header-title').find('h2').text());
      res.end(JSON.stringify(names));
    });
  });
});

module.exports = router;
