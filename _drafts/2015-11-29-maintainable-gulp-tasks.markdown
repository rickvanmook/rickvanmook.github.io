---
layout: post
title: Maintainable Gulp tasks
date: 2015-11-29 19:33:08
categories: writing
number: "XX"
---

##Once upon a time
Working on a lot of automated build projects. Either with Grunt, Gulp or whatever.

##every day
Every time these files grow out to be this huge unmaintainable mess.

##one day
One day I decided to Google a way to improve this. Turns out, a lot of people had similar problems and found some cool
solutions for that.

##because of that
I took my learnings from one of them and adapted my own preferred style.

##because of that
How it works:

##until
What I like the most is a clear overview of what tasks are available just by looking at the folder structure


{% highlight javascript %}

var globalVar;

/**
 * Constructor for <code>AjaxRequest</code> class
 * @param url the url for the request<p/>
 */

function AjaxRequest(url) {

  var urls = [ "www.cnn.com", 5, globalVar];

  this.request = new XMLHttpRequest();
  url = url.replace(/^\s*(.*)/, "$1"); // skip leading whitespace

  /* check the url to be in urls */
  var a = "\u1111\z\n\u11";
  this.foo = new function() {};

  foo();

  #
}
{% endhighlight %}