/* Panning is from the easey project
https://github.com/mapbox/easey/blob/gh-pages/src/easey.handlers.js
*/

$(function() {
	window.panning=function (map, drag) {

        var p = {};
        drag = drag || 0.15;

        var speed = { x: 0, y: 0 },
            dir = { x: 0, y: 0 },
            removed = false,
            nowPoint = null,
            oldPoint = null,
            moveTime = null,
            prevMoveTime = null,
            animatedLastPoint = true,
            t,
            prevT = new Date().getTime();

        p.down = function(e) {
            nowPoint = oldPoint = MM.getMousePoint(e, map);
            moveTime = prevMoveTime = +new Date();
        };

        p.move = function(e) {
            if (nowPoint) {
                if (animatedLastPoint) {
                    oldPoint = nowPoint;
                    prevMoveTime = moveTime;
                    animatedLastPoint = false;
                }
                nowPoint = MM.getMousePoint(e, map);
                moveTime = +new Date();
            }
        };

        p.up = function() {
			if (!nowPoint) {
	            nowPoint = oldPoint = null;
		        moveTime = null;
		        return;
			}
            if (+new Date() - prevMoveTime < 50) {
                dt = Math.max(1, moveTime - prevMoveTime);
                dir.x = nowPoint.x - oldPoint.x;
                dir.y = nowPoint.y - oldPoint.y;
                speed.x = dir.x / dt;
                speed.y = dir.y / dt;
            } else {
                speed.x = 0;
                speed.y = 0;
            }
            nowPoint = oldPoint = null;
            moveTime = null;
        };

        p.remove = function() {
            removed = true;
        };

        function animate(t) {
            var dt = Math.max(1, t - prevT);
            if (nowPoint && oldPoint) {
                if (!animatedLastPoint) {
                    dir.x = nowPoint.x - oldPoint.x;
                    dir.y = nowPoint.y - oldPoint.y;
                    map.panBy(dir.x, dir.y);
                    animatedLastPoint = true;
                }
            } else {
                // Rough time based animation accuracy
                // using a linear approximation approach
                speed.x *= Math.pow(1 - drag, dt * 60 / 1000);
                speed.y *= Math.pow(1 - drag, dt * 60 / 1000);
                if (Math.abs(speed.x) < 0.001) {
                    speed.x = 0;
                }
                if (Math.abs(speed.y) < 0.001) {
                    speed.y = 0;
                }
                if (speed.x || speed.y) {
                    map.panBy(speed.x * dt, speed.y * dt);
                }
            }
            prevT = t;
            if (!removed) MM.getFrame(animate);
        }

        MM.getFrame(animate);
        return p;
    }
});
