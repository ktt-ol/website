# Mainframe's Website

This is the Website of Oldenburg's Hackspace AKA Mainframe.


# Building local

## Setup

You need ```hyde``` to generate the html files. You may install it with ```pip```

```
sudo pip install hyde
```

## Building

```
hyde gen
```

or

```
hyde gen -r
```

to generate all files. Alternatively you can use make, which calls hyde
gen, but takes care of the dependencies unknown to hyde:

```
make
```

You'll find the generated homepage in the ```deploy/``` directory. Use

```
hyde serve
```

to open a local web server for a preview ( http://localhost:8080 ).

## Jinja Documentation

 * http://jinja.pocoo.org/docs/templates/#filters
 * http://jinja.pocoo.org/docs/templates/#builtin-filters
