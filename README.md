This is the git repo for the Marikollan 2015 website.

http://beta.marikollan.no/

# How to get started
## Prerequisites
* Git
* [Node](https://nodejs.org/)
  * [Gulp](https://www.npmjs.com/package/gulp)
  * [Bower](https://www.npmjs.com/package/bower)

Gulp and Bower must be installed after Node and can be installed with `sudo npm install -g bower gulp`.

## Magic sauce recipe
```bash
git clone https://github.com/M4R7iNP/marikollan-2015
cd marikollan-2015
npm install
bower install
gulp bower
gulp dev
```
* `npm install` and `bower install` will download all dependencies.
* `gulp bower` will move client side dependecies to public directory.
* `gulp dev` will start the web server, watch the less files and compile them when written.

In order to push you changes to the repo you will need to fork this repo and send a pull request.

To get some dummy content, do this:
```bash
cd public
wget http://beta.marikollan.no/files/marikollan_pages_2014.tar.gz
tar xf marikollan_pages_2014.tar.gz
rm marikollan_pages_2014.tar.gz
```
Note that this is old content from marikollan.no 2014 or 2012. Pretty outdated.

# TODO
[ ] Do something fun with the design
[x] Load pages async with `jQuery.ajax`
[ ] Maybe move all bower modules to `public/bower_componenets`. (Right now bootstrap.js are not copied to public/js/lib)
[ ] Maybe find a new CMS that writes to e.g. PostgreSQL and fetch pages from there.
[ ] Maybe implement a 'X-Revision'-header that refreshes on each server side deploy so that the client can reload to get new css
