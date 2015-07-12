This is the git repo for the website for Marikollan 2015.

== How to get started ==
==== Prerequisites ====
* Git
* Node
  * [https://www.npmjs.com/package/gulp](Gulp)
  * [https://www.npmjs.com/package/bower](Bower)

Gulp and Bower must be installed after Node and can be installed with `sudo npm install -g bower gulp`.

==== Magic sauce ====
```bash
git clone <repo url>
cd marikollan-2015
npm install
bower install
gulp bower
gulp dev
```

That last command will start the web server, watch the less files and compile them when written.

To get some content do this:
```bash
cd public/pages
wget http://mlan2015.m4r7.in/pages_dump.tar.gz
tar xf pages_dump.tar.gz
rm pages_dump.tar.gz
```

== TODO ==
* Do something with the design
Long term:
* Maybe move all bower modules to `public/bower_componenets`.
* Maybe find a new CMS that writes to e.g. PostgreSQL and fetch pages from there.
