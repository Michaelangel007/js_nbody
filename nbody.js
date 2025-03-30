/*
Ver 1.0 Physics: Use Newton's Law of Attraction
Ver 1.1 Render: Visualize Velocity Vector
Ver 1.2 Render: Visualize Force Vector
Ver 1.3 Update: Add mouse instructions, CSS key border
Ver 1.4 Fix: use strict
Ver 1.5 Update instructions to always be on top, display theme and world
*/
"use strict";
var Magnetic = new
(
    function()
    {
        var isMobile = false
            || navigator.userAgent.toLowerCase().indexOf("android") != -1
            || navigator.userAgent.toLowerCase().indexOf("iphone")  != -1
            || navigator.userAgent.toLowerCase().indexOf("ipad")    != -1,
            i = window.innerWidth,
            j = window.innerHeight,
            gx = window.innerWidth  -i,
            gy = window.innerHeight -j,
            NewMagParticles = 20,
            draw,
            doubleClickMS = 400,
            bDrawMotionVector = 1,
            bDrawForceVector = 1,
            bDrawToonShading = 1, // black outline

            aParticle = [],
            aMagnet = [],
            aMagnet = [],
            w = false,
            time = 0,
            G = 0.01,
            gPhysicsTimer,
            gFrame = 0,

            idWorld,
            idCurWorld, idMaxWorld,
            idCurTheme, idMaxTheme,
            idCurParts,

            iWorld = 0,
            iTheme = 0,
            aTheme = [
                // Circle solid color, fade to color, , rect background color(alpha = motion blur)
                {glowA:"rgba(  0,  0,255,0.5)",glowB:"rgba(255,  0,  0,0.5)",particleFill:"#ffffff"          ,fadeFill:"rgba(  0 , 0,  0,0.25)",useFade:false,forcePos:"rgba(0,255,0,255)",fourceNeg:"rgba(255,0,0)",motion:"#0000FF"},
                {glowA:"rgba(230,  0,  0,0.3)",glowB:"rgba(230,  0,  0,0.0)",particleFill:"#ffffff"          ,fadeFill:"rgba( 11, 11, 11, .6 )",useFade:true ,forcePos:"rgba(0,255,0,255)",fourceNeg:"rgba(255,0,0)",motion:"#0000FF"},
                {glowA:"rgba(  0,230,  0,0.3)",glowB:"rgba(  0,230,  0,0.0)",particleFill:"rgba(0,230,0,0.7)",fadeFill:"rgba( 22, 22, 22, .6 )",useFade:true ,forcePos:"rgba(0,255,0,255)",fourceNeg:"rgba(255,0,0)",motion:"#0000FF"},
                {glowA:"rgba(  0,  0,  0,0.3)",glowB:"rgba(  0,  0,  0,0.0)",particleFill:"#333333"          ,fadeFill:"rgba(255,255,255, .6 )",useFade:true ,forcePos:"rgba(0,255,0,255)",fourceNeg:"rgba(255,0,0)",motion:"#0000FF"},
                {glowA:"rgba(  0,  0,  0,0.0)",glowB:"rgba(  0,  0,  0,0.0)",particleFill:"#333333"          ,fadeFill:"rgba(255,255,255, .2 )",useFade:true ,forcePos:"rgba(0,255,0,255)",fourceNeg:"rgba(255,0,0)",motion:"#0000FF"},
                {glowA:"rgba(  0,  0,255,0  )",glowB:"rgba(255,  0,230,0.0)",particleFill:"#ffffff"          ,fadeFill:"rgba(255,255,255,0.25)",useFade:true ,forcePos:"rgba(0,255,0,255)",fourceNeg:"rgba(255,0,0)",motion:"#0000FF"}
            ];

        function ChangeTheme( delta )
        {
            var nTheme = aTheme.length - 1;
            iTheme += delta;
            iTheme = iTheme < 0 ? nTheme : iTheme;
            iTheme = iTheme > nTheme ? 0 : iTheme;
            idCurTheme.innerText = (iTheme + 1);
            idMaxTheme.innerText = (nTheme + 1);

            var nParticle = aParticle.length;
            for( var iParticle = 0; iParticle < nParticle; iParticle++ )
            {
                var particle = aParticle[ iParticle ];
                ParticleColor( particle );
            }
        }

        function ChangeWorld( delta )
        {
            DeleteParticles();
            DeleteMagnets(); 

            iWorld += delta;
            iWorld = iWorld < 0 ? 3 : iWorld;
            iWorld = iWorld > 3 ? 0 : iWorld;
            idCurWorld.innerText = (iWorld + 1);
            idMaxWorld.innerText = '4';

            if( iWorld == 0 )
            {
                CreateMagnet( { x:1*i/2, y:1*j/2}, 100 );
            }
            else
            if( iWorld == 1 )
            {
                CreateMagnet( { x:3*i/4, y:1*j/4}, j/4 );
                CreateMagnet( { x:3*i/4, y:3*j/4}, j/4 );
            }
            else
            if( iWorld == 2 )
            {
                // init 3 magnets/attractors + 1 repulsor
                CreateMagnet( { x:1*i/4, y:1*j/4}, 100 );
                CreateMagnet( { x:3*i/4, y:1*j/4}, j/4 );
                CreateMagnet( { x:1*i/4, y:3*j/4},-200 );
                CreateMagnet( { x:3*i/4, y:3*j/4}, j/4 );
            }
            else // Original World
            {
                for(var iMagnet = 0; iMagnet < 4; iMagnet++ )
                    CreateMagnet(
                        {
                            x:i * Math.random(),
                            y:j * Math.random()
                        },
                        Math.random() * 200 - 50
                    );
            }
            ChangeTheme(0);
            idCurParts.innerText = aParticle.length;
        }

        function CreateMagnet(a,force)
        {
            var iParticle, particle, magnet;
            magnet = new Magnet( force );
            magnet.position.x = a.x;
            magnet.position.y = a.y;
            aMagnet.push( magnet );
            var angle = 0;
            for( iParticle = 0; iParticle < NewMagParticles; iParticle++ )
            {
                var particle = new Particle;

                if( iTheme == 0 )
                    particle.size = 10.0 * (iParticle / NewMagParticles) +  1;
                else
                    particle.size = 2 * (iParticle / NewMagParticles + 0.1);

                particle.angle = angle;
                angle = 2*Math.PI * (iParticle / NewMagParticles);
                particle.distance = force;

            particle.speed = 1; // geocentric orbier, speed = 1
//particle.speed = particle.size /10; // nice snake trail
// alert( "Particle # " + iParticle + " / " + NewMagParticles + "\n" + " v.x: " + particle.velocity.x + " \n v.y: " +  particle.velocity.y + "\n" );

                particle.position.x = magnet.position.x + Math.cos( particle.angle ) * particle.distance;
                particle.position.y = magnet.position.y + Math.sin( particle.angle ) * particle.distance;

                // Initial velocity is tangent
                // d( cos ) = -sin
                // d( sin ) =  cos
                particle.velocity.x = -Math.sin( particle.angle ) * particle.speed;
                particle.velocity.y =  Math.cos( particle.angle ) * particle.speed;

                ParticleColor( particle, iTheme );
                aParticle.push( particle );
            }
        }

        function DeleteParticles()
        {
            var nParticle = aParticle.length, particle;
            for( var iParticle = 0; iParticle < nParticle; iParticle++ )
            {
                particle = aParticle.pop();
            }
            particle = null;
        }

        function DeleteMagnets()
        {
            var nMagnet = aMagnet.length, magnet;
            for( var iMagnet = 0; iMagnet < nMagnet; iMagnet++ )
            {
                magnet = aMagnet.pop();
            }
            magnet = null;
        }

        function Distance(a,b) // B Distance2D(x,y)
        {
            var dx = b.x - a.x,
                dy = b.y - a.y;
            return Math.sqrt( dx*dx + dy*dy)
        }

        function Draw()
        {
            var particle, iParticle, nParticle;
            var magnet, iMagnet, nMagnet;
            var begColor, endColor;

            // Draw Magnet(s)
            nMagnet = aMagnet.length;
            for( iMagnet = 0; iMagnet < nMagnet; iMagnet++ )
            {
                magnet = aMagnet[ iMagnet ];
                var c = draw.createRadialGradient( magnet.position.x, magnet.position.y, 1, magnet.position.x, magnet.position.y, magnet.size );

                if( magnet.force >= 0)
                    c.addColorStop( 0, aTheme[ iTheme ].glowA );
                else
                    c.addColorStop( 0, aTheme[ iTheme ].glowB );

                c.addColorStop( 1, aTheme[ iTheme ].fadeFill );

                draw.beginPath();
                    draw.fillStyle = c;
                    draw.arc( magnet.position.x, magnet.position.y, magnet.size, 0, Math.PI*2, true );
                    draw.fill();
                draw.closePath();

                draw.beginPath();
                    draw.fillStyle = c;
                    draw.arc( magnet.position.x, magnet.position.y, Math.sqrt(magnet.size), 0, Math.PI*2, true );
                    draw.fill();
                draw.closePath();
            }

            // Draw Particle(s)
            nParticle = aParticle.length;
            for( iParticle = 0 ; iParticle < nParticle; iParticle++ )
            {
                particle = aParticle[ iParticle ];

                draw.beginPath();
                draw.fillStyle = particle.color;
                draw.arc( particle.position.x, particle.position.y, particle.size, 0, Math.PI*2, true );
                draw.fill();
                if( bDrawToonShading ) { // draw black outline around particles ...
                    draw.lineWidth = 1;
                    draw.strokeStyle = "#000000";
                    draw.stroke();
                }
                draw.closePath();

                // Draw Velocity Vector
                if( bDrawMotionVector )
                {
                    draw.strokeStyle = aTheme[iTheme].motion; // "#000000";
                    DrawArrow( particle.position.x, particle.position.y, particle.position.x + 25 * particle.velocity.x, particle.position.y + 25 * particle.velocity.y );
                }
            }
        }

        // ==========
        // http://jsfiddle.net/8E9t3/
        // http://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
        function DrawArrow( fromx, fromy, tox, toy){
            var headlen = 5;   // length of head in pixels
            var angle = Math.atan2(toy-fromy,tox-fromx);
        //    alert( "fromX: " + fromx + "\n" + "fromY: " + fromy + "\n" + "toX: " + tox + "\n" + "toY: " + toy + "\n" );
            draw.beginPath(); // without this has bug: draws last particle with black outline 
            draw.lineWidth = 1;
            draw.moveTo(fromx, fromy);
            draw.lineTo(tox, toy);
            draw.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
            draw.moveTo(tox, toy);
            draw.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
            draw.stroke();
            draw.closePath();
        }

        function EraseBackground()
        {
            if( aTheme[ iTheme ].useFade )
            {
                draw.fillStyle = aTheme[iTheme].fadeFill;
                draw.fillRect( 0, 0, draw.canvas.width, draw.canvas.height )
            }
            else
            {
                draw.fillStyle = "#ffffff";
                draw.clearRect( 0, 0, idWorld.width, idWorld.height );
            }
        }

        function onMouseMove( input )
        {
            gx = input.clientX-(window.innerWidth  - i) * 0.5;
            gy = input.clientY-(window.innerHeight - j) * 0.5
        }

        function onMouseDown( input )
        {
            input.preventDefault();
            updateMagnet();
        }

        function onMouseUp()
        {
            var magnet;
            w = false;
            for( var iMagnet = 0, nMagnet = aMagnet.length; iMagnet < nMagnet; iMagnet++)
            {
                magnet = aMagnet[ iMagnet ];
                magnet.dragging = false;
            }
        }

        // ==========
        function onKeyDown( input )
        {
            // http://unixpapa.com/js/key.html
            if( input.keyCode == 37 )
                ChangeTheme( -1 ); // left
            else 
            if( input.keyCode == 39 )
                ChangeTheme( +1 ); // right
            else
            if( input.keyCode == 38 ) // up
                ChangeWorld( -1 );
            else
            if( input.keyCode == 40 ) // down
                ChangeWorld( +1 );
            else
            if( input.keyCode == 86 ) // V = toggle drawing Velocity Vectors
                bDrawMotionVector = 1 - bDrawMotionVector;
            else
            if( input.keyCode == 70 ) // F = toggle drawing Force Vectors
                bDrawForceVector = 1 - bDrawForceVector;
        }

        function onTouchStart( input )
        {
            if (input.touches.length == 1)
            {
                input.preventDefault();
                gx = a.touches[0].pageX - (window.innerWidth -i)*0.5;
                gy = a.touches[0].pageY - (window.innerHeight-j)*0.5;
                updateMagnet();
            }
        }
        function onTouchMove( input )
        {
            if (input.touches.length==1)
            {
                input.preventDefault();
                gx = a.touches[0].pageX - (window.innerWidth -i)*0.5;
                gy = a.touches[0].pageY - (window.innerHeight-j)*0.5;
            }
        }
        function onTouchEnd()
        {
            onMouseUp();
        }

        function onWindowResize()
        {
            i = window.innerWidth;
            j = window.innerHeight;
            idWorld.width  = i;
            idWorld.height = j;
console.log( 'Window resize: ' + i + ' x ' + j );
        }

        function ParticleColor( particle  )
        {
            var r = Math.floor(255. * Math.random());
            var g = Math.floor(255. * Math.random());
            var b = Math.floor(255. * Math.random());
            var a = 0.5; 
            var c = "rgba( " + r + "," + g + "," + b + "," + a + ")";
            var nTheme = aTheme.length - 1;
            if( iTheme == 0 || iTheme == nTheme )
                particle.color = c; // "rgba(255,0,255,0.5)";
            else
                particle.color = aTheme[ iTheme ].particleFill;
        }

        function Physics( timestamp )
        {
            var deltaT = (timestamp - gPhysicsTimer) / 1000.; // convert to seconds
            gPhysicsTimer = timestamp;
            gFrame++;

            var magnet,iMagnet,nMagnet;
            var particle,iParticle,nParticle;
            var dx,dy,distance2,F;
            var acceleration = { x:0, y:0 };
            var jerk = { x:0, y:0 };

            var iRemove = -1;
            for( iMagnet = 0, nMagnet = aMagnet.length; iMagnet < nMagnet; iMagnet++ )
            {
                magnet = aMagnet[ iMagnet ];
                if( magnet.dragging )
                {
                    magnet.position.x += (gx - magnet.position.x) * 0.2; // 20% lerp towards destination
                    magnet.position.y += (gy - magnet.position.y) * 0.2; // 20% lerp towards destination
                }
                else
                    if ( magnet.position.x < 0 || magnet.position.y < 0 || magnet.position.x > i || magnet.position.y > j)
                    {
                        iRemove = iMagnet; // dragged off-screen?
                        break;
                    }
            }

            iRemove != -1 && aMagnet.length > 1 && aMagnet.splice( iRemove, 1 );
            nMagnet = aMagnet.length;

            nParticle = aParticle.length;
            for( iParticle = 0; iParticle < nParticle; iParticle++)
            {
                particle = aParticle[ iParticle ];
                jerk.x = 0;
                jerk.y = 0;
                acceleration.x = 0;
                acceleration.y = 0;
                for ( iMagnet = 0; iMagnet < nMagnet; iMagnet++)
                {
                    magnet = aMagnet[ iMagnet ];
                    dx = magnet.position.x - particle.position.x;
                    dy = magnet.position.y - particle.position.y;
                    distance2 = (dx*dx) + (dy*dy);
                    F = G * (particle.size * magnet.force) / distance2;

                    // Newtonian solution
                    // F = G * (m1*m2) / distance^2
                    // a = F/m
                    jerk.x = dx * F / particle.size;
                    jerk.y = dy * F / particle.size;

                    if( bDrawForceVector)
                    {
                        if( magnet.force >= 0 )
                            draw.strokeStyle = aTheme[iTheme].forcePos; // "#0000FF";
                        else
                            draw.strokeStyle = aTheme[iTheme].forceNeg; // "#FF0000";
                        DrawArrow( particle.position.x, particle.position.y, particle.position.x + 2000 * jerk.x, particle.position.y + 2000 * jerk.y );
                    }

                    acceleration.x += jerk.x;
                    acceleration.y += jerk.y;
                }
                particle.velocity.x += acceleration.x;
                particle.velocity.y += acceleration.y;

                particle.position.x += particle.velocity.x;
                particle.position.y += particle.velocity.y;
            }
        }

        function Update( timestamp )
        {
            EraseBackground();
            Physics( timestamp );
            Draw();
            requestAnimationFrame( Update );
        }

        function UpdateFirstFrame( timestamp )
        {
            gFrame = 0;
            gPhysicsTimer = timestamp;
            requestAnimationFrame( Update );
        }

        function updateMagnet()
        {
            var magnet = null;
            w = true;
// double-click
            if (((new Date).getTime() - time) < doubleClickMS)
            {
                // double click remove magnet
                CreateMagnet( {x:gx,y:gy}, 100 );
                time = 0
            }
            time = (new Date).getTime();
            for( var iMagnet = 0, nMagnet = aMagnet.length; iMagnet < nMagnet; iMagnet++ )
            {
                magnet = aMagnet[ iMagnet ];
// bugfix: Math.abs
                if( Distance( magnet.position, {x:gx,y:gy} ) < Math.sqrt(Math.abs(magnet.force)))
                {
                    magnet.dragging = true;
                    break;
                }
            }
        }

        this.init = function()
        {
            idCurWorld = document.getElementById('CurWorld');
            idMaxWorld = document.getElementById('MaxWorld');
            
            idCurTheme = document.getElementById('CurTheme');
            idMaxTheme = document.getElementById('MaxTheme');
            
            idCurParts = document.getElementById('CurParts');

            idWorld = document.getElementById("world");
            if ( idWorld && idWorld.getContext)
            {
                draw = idWorld.getContext("2d");
                if (isMobile)
                    idWorld.style.border="none";

                document.addEventListener( "mousemove" , onMouseMove   , false );
                 idWorld.addEventListener( "mousedown" , onMouseDown   , false );
                document.addEventListener( "mouseup"   , onMouseUp     , false );
                document.addEventListener( "keydown"   , onKeyDown     , false );
                  window.addEventListener( "resize"    , onWindowResize, false );
                 idWorld.addEventListener( "touchstart", onTouchStart  , false );
                document.addEventListener( "touchmove" , onTouchMove   , false );
                document.addEventListener( "touchend"  , onTouchEnd    , false );

                onWindowResize();
                ChangeWorld ( 0 );
                //setInterval( Update, 1E3 / 60 ) // old school framerate = 1000 ms/s / #frames/s = 1000/#frames
                requestAnimationFrame( UpdateFirstFrame );
            }
        }
    }
);

function Particle()
{
    this.size = 0.5+Math.random()*3.5; // size and mass
    this.position = {x:0,y:0}; // vector
    this.velocity = {x:1,y:0}; // vector
    this.color = "#FF00FF";

    this.speed = 0.01+this.size/5*0.03; // scalar
    this.angle = 360.0 * Math.random(); // starting angle
    this.distance = 50 + Math.random()*100; // starting distance away from magnet
}

function Magnet(force)
{
    this.force = force;
    this.position = {x:0,y:0};
    this.dragging = false;
    this.connections = 0;
    this.size = Math.abs(force); // radius
}

function OnLoad()
{
    Magnetic.init();
}
