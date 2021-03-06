(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module with d3 as a dependency.
        define(['d3'], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        var d3 = require('d3')
        module.exports = factory(d3)
    } else {
        // Browser global.
        root.d3.contextMenu = factory(root.d3)
    }
}(	this, 
	function(d3) {
		return function (menu, opts) {

			var openCallback,
				closeCallback,
				afterOpenbCallback;

			if (typeof opts === 'function') {
				openCallback = opts;
			} else {
				opts = opts || {};
				openCallback = opts.onOpen;
				closeCallback = opts.onClose;
				afterOpenbCallback = opts.afterOpen;
			}

			// create the div element that will hold the context menu
			d3.selectAll('.d3-context-menu').data([1])
				.enter()
				.append('div')
				.attr('class', 'd3-context-menu');

			// close menu
			d3.select('body').on('click.d3-context-menu', function() {
				d3.select('.d3-context-menu').style('display', 'none');
				if (closeCallback) {
					closeCallback();
				}
			});

			// this gets executed when a contextmenu event occurs
			return function (data, index) {
				var elm = this;

				d3.selectAll('.d3-context-menu').html('');
				var list = d3.selectAll('.d3-context-menu')
					.on('contextmenu', function (d) {
						d3.select('.d3-context-menu').style('display', 'none');
						d3.event.preventDefault();
						d3.event.stopPropagation();
					})
					.append('ul');
				list.selectAll('li').data(typeof menu === 'function' ? menu(data) : menu).enter()
					.append('li')
					.attr('class', function (d) {
						var ret = '';
						if (d.divider) {
							ret += ' is-divider';
						}
						if (d.disabled) {
							ret += ' is-disabled';
						}
						if (!d.action) {
							ret += ' is-header';
						}
						if (d.hasSubmenu) {
							ret += ' has-submenu';
						}
						return ret;
					})
					.html(function (d) {
						if (d.divider) {
							return '<hr>';
						}
						if (!d.title) {
							console.error('No title attribute set. Check the spelling of your options.');
						}
						if (d.hasSubmenu) {
							return d.title + "<ul class=" + "'is-subMenu' style= " + "'display: none'" + "><li><input></ul></li>"
						}
						return (typeof d.title === 'string') ? d.title : d.title(data);
					})
					.on('click', function (d, i) {
						if (d.disabled) return; // do nothing if disabled
						if (!d.action) return; // headers have no "action"
						if (d.hasSubmenu) {
							value = d3.select(this).select('.is-subMenu input').property("value");
							d.action(value);
						} else {
							d.action(elm, data, index);
						}
						d3.select('.d3-context-menu').style('display', 'none');

						if (closeCallback) {
							closeCallback();
						}
					})
					.on("keyup", function (d, i) {
						if (d3.event.key === "Enter") {
							value = d3.select(this).select('.is-subMenu input').property("value");
							d.action(value);
							d3.select('.d3-context-menu').style('display', 'none');

							if (closeCallback) {
								closeCallback();
							}
						}
					});

				d3.select(".is-subMenu").on("click", function () {
					d3.event.preventDefault();
					d3.event.stopPropagation();
				})

				d3.select(".has-submenu").on("mouseenter", function () {
					d3.select(this).select(".is-subMenu").style("display", "block")
				})

				d3.select(".has-submenu").on("mouseleave", function () {
					d3.select(this).select(".is-subMenu").style("display", "none")
				})

				// the openCallback allows an action to fire before the menu is displayed
				// an example usage would be closing a tooltip
				if (openCallback) {
					if (openCallback(data, index) === false) {
						return;
					}
				}

				// display context menu
				d3.select('.d3-context-menu')
					.style('left', (d3.event.pageX - 2) + 'px')
					.style('top', (d3.event.pageY - 2) + 'px')
					.style('display', 'block');

				if (afterOpenbCallback) {
					if (afterOpenbCallback(data, index) === false) {
						return;
					}
				}

				d3.event.preventDefault();
				d3.event.stopPropagation();
			};
		};
	}
));
