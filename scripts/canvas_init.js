
const ROTRANGE = 10*Math.PI/180 //radians

var cobj = {
  pl:'x',
  matrix:[],
  m:3,
  n:3,
  boardRot:0,
  bgColor:'black',
  fgColor:'white',
  penColor:'white',
  xRot:0,
  oRad:20,
  aimode:0,
  init:-1
}

function toInitState(cobj) {
  cobj.matrix = Array.from(Array(cobj.m*cobj.n),() => '-')
  cobj.pl='x'
  cobj.init = -1
}

function initCanvas(canvas,aimode) {
  toInitState(cobj)
  setCanvasDims(canvas)
  cobj.canvas = canvas
  cobj.aimode = aimode
  cobj.ctx = canvas.getContext('2d')

  var ctx = cobj.ctx
  ctx.globalAlpha = 0.4
  //redrawAnimate( (function() {
    cobj.boardRot = Math.random()*ROTRANGE-ROTRANGE/2
    do {
      cobj.bgColor = randomColor()
      cobj.fgColor = randomColor()
    } while(Math.abs(colorToNumber(cobj.fgColor)-colorToNumber(cobj.bgColor))<=300 )
    drawBoard(cobj)
  //}).bind(cobj))
  cobj.penColor = randomColor()

  cobj.drawer1 = setInterval((function() {
    drawBoard(this)
    this.xRot=this.xRot+0.1
    if(this.xRot>2*Math.PI) this.xRot=0
    this.oRad=this.oRad+1
    if(this.oRad>20) this.oRad=-20
    //this.penColor = randomColor()
  }).bind(cobj),100)

  canvas.addEventListener('click',(function(e) {
    e.preventDefault()
    var mousePos = getTransformedCoords(this,e)
    handleClick(this,mousePos)
  }).bind(cobj))

  window.addEventListener('resize',function(e) {
    setCanvasDims(canvas)
  })
}

function setCanvasDims(canvas) {
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth
  /*var ctx = canvas.getContext('2d')
  ctx.font = '48px serif'
  ctx.fillText('('+canvas.width+','+canvas.height+')',50,50)*/
}

function handleClick(cobj, mousePos) {
  if(cobj.init==10) return //some player won. Hence disabling.
  var canvas = cobj.canvas
  var ctx = cobj.ctx
  var coord = {
    x: ~~(cobj.n*mousePos.x/canvas.width),
    y: ~~(cobj.m*mousePos.y/canvas.height)
  }
  var emptyspace = setMatrix(cobj,coord)
  if(emptyspace) {
    if(cobj.pl == 'x') {
      drawX(cobj,coord)
      if(hasWon(cobj)) celebrate(cobj)
      else if(allFilled(cobj)) {
        cobj.pl='(^_^) No one'
        celebrate(cobj)
      }
      else if(cobj.aimode) {
        cobj.init = 2 //disable draw board function
        cobj.pl='o'
        mousePos = findBestMove(cobj)
        handleClick(cobj,mousePos)
        if(cobj.init != 10) cobj.init = 1 //reenable draw board function
        cobj.pl='x'
      } else {
        cobj.pl='o'
      }
    }
    else {
      drawO(cobj,coord)
      if(hasWon(cobj))
        celebrate(cobj)
      else if(allFilled(cobj)) {
        cobj.pl='(^_^) No one'
        celebrate(cobj)
      } else
        cobj.pl='x'
    }
  }
}

function setMatrix(cobj,coord) {
  var index = coord.x+coord.y*cobj.n
  if(cobj.matrix[index]=='-') {
    cobj.matrix[index]=cobj.pl
    return true
  }
  return false
}

function drawBoard(cobj) {
  if(cobj.init==2) return;
  var ctx = cobj.ctx
  var canvas = cobj.canvas
  var m=cobj.m,n=cobj.n
  ctx.fillStyle = cobj.bgColor
  ctx.fillRect(0,0,canvas.width, canvas.height)
  ctx.save()
  ctx.lineCap = 'round'
  ctx.translate(canvas.width/2,canvas.height/2)
  ctx.rotate(cobj.boardRot)
  ctx.translate(-canvas.width/2,-canvas.height/2)
  ctx.lineWidth = 5
  ctx.strokeStyle = cobj.fgColor
  var widthIndent = canvas.width*3/100
  var heightIndent = canvas.height*3/100
  var dmw = canvas.width/m,dnw=canvas.width/n,dmh=canvas.height/m,dnh=canvas.height/n

  ctx.beginPath()
  for(var i=0;i<n-1;i++) {
    ctx.moveTo((i+1)*dnw,heightIndent)
    ctx.lineTo((i+1)*dnw,canvas.height-heightIndent)
  }
  for(var i=0;i<m-1;i++) {
    ctx.moveTo(widthIndent,(i+1)*dmh)
    ctx.lineTo(canvas.width-widthIndent,(i+1)*dmh)
  }
  ctx.stroke()
  ctx.restore()

  for(var i=0;i<m*n;i++) {
    var coord = {x:i%n,y:~~(i/n)}
    if(cobj.matrix[i]=='x') drawX(cobj,coord)
    else if(cobj.matrix[i]=='o') drawO(cobj,coord)
  }
}

function drawX(cobj,coords) {
  var ctx = cobj.ctx
  var canvas = cobj.canvas
  var m=cobj.m,n=cobj.n

  var errRange = 50
  var ox = canvas.width/n
  var oy = canvas.height/m
  var ix = canvas.width/60//+Math.random()*errRange-errRange/2
  var iy = canvas.height/60//+Math.random()*errRange-errRange/2

  var startx = ix+coords.x*ox
  var starty = iy+coords.y*oy

  ctx.save()
  ctx.translate(startx+ox/2,starty+oy/2)
  ctx.rotate(cobj.xRot)
  ctx.translate(-startx-ox/2,-starty-oy/2)

  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  ctx.strokeStyle = cobj.penColor
  ctx.beginPath()
  ctx.moveTo(startx,starty)
  ctx.lineTo(startx+ox-ix,starty+oy-iy)
  ctx.moveTo(startx,starty+oy-iy)
  ctx.lineTo(startx+ox-ix, starty)
  ctx.stroke()
  ctx.restore()
}

function drawO(cobj,coords) {
  var ctx = cobj.ctx
  var canvas = cobj.canvas
  var m=cobj.m,n=cobj.n

  var errRange = 20
  var ox = canvas.width/n
  var oy = canvas.height/m
  var ix = canvas.width/60+cobj.oRad/2//+Math.random()*errRange-errRange/2
  var iy = canvas.height/60+cobj.oRad/2//+Math.random()*errRange-errRange/2
  var wx = (ox - 2*ix)/2
  var wy = (oy - 2*iy)/2

  var startx = ix+coords.x*ox
  var starty = iy+coords.y*oy

  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  ctx.strokeStyle = cobj.penColor
  ctx.beginPath()
  ctx.ellipse(startx+wx,starty+wy,wx,wy,2*Math.PI/**(Math.random()*errRange - errRange/2)/10*/,0,2*Math.PI)
  //ctx.arc(startx+wx,starty+wx,wy,135*Math.PI/180,2*Math.PI)
  ctx.stroke()
}

function randomColor() {
  var str = Math.floor(Math.random()*(256**3-1)).toString(16)
  str = '#'+"000000".substring(0,6-str.length)+str
  return str
}

function colorToNumber(colorstr) {
  /* Converts a color string - base 16 to a base 10 number */
  return parseInt(colorstr.substr(1),16)
}

function getTransformedCoords(cobj,e) {
  var canvas = cobj.canvas
  var coords = getMousePos(cobj,e)
  var halfs = [canvas.width/2,canvas.height/2]
  var cos = Math.cos(cobj.boardRot)
  var sin = Math.sin(cobj.boardRot)
  var x = coords.x - halfs[0]
  var y = coords.y - halfs[1]
  return {
    x:halfs[0]+x*cos+y*sin,
    y:halfs[1]-x*sin+y*cos
  }
}

function getMousePos(cobj, e) {
  var rect = cobj.canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

function spark_helper() {
    var ctx = this.ctx
    var coord = this.coord
    ctx.strokeStyle = randomColor()
    ctx.strokeWidth = 7
    ctx.beginPath()
    ctx.moveTo(coord.x,coord.y)
    ctx.lineTo(coord.x+~~(Math.random()*70-35),coord.y+~~(Math.random()*70-35))
    ctx.stroke()
}

function spark(ctx,coord) {
  var s = { ctx:ctx,n:~~(Math.random()*25), coord: coord}

  redrawAnimate(spark_helper.bind(s),s.n)
}

function redrawAnimate(drawFunction,n=20) {
  drawFunction()
  if(n>0)
    requestAnimationFrame(function() {redrawAnimate(drawFunction,n-1)})
}

function allFilled(cobj) {
  if(cobj.matrix.includes('-')) return false
  return true
}

function hasWon(cobj) {
  /*If the player who's turn it is, has won.*/
  var matrix = cobj.matrix,pl=cobj.pl
  var m=cobj.m,n=cobj.n,k=0
  const preq = 3

  for(var i=0;i<m;i++) {
    for(var j=0;j<n;j++) {
      var index = i*m+j
      if(matrix[index]==pl) {
        var hb = ~~(index/n)==~~((index+preq-1)/n) //horizontal bound
        var vb = index+m*(preq-1)<m*n //vertical bound
        for(k=1;k<preq && hb;k++)
          if(matrix[index+k]!=pl) break
        if(k==preq) return true //Horizontal
        for(k=1;k<preq && vb;k++)
          if(matrix[index+k*n]!=pl) break
        if(k==preq) return true //Vertical
        for(k=1;k<preq && hb && vb;k++)
          if(matrix[index+k*n+k]!=pl) break
        if(k==preq) return true //diagonal \
        for(k=1;k<preq && vb && ~~(index/n)==~~((index-preq+1)/n);k++)
          if(matrix[index+k*n-k]!=pl) break
        if(k==preq) return true
      }
    }
  }
  return false
}

function findBestMove(cobj) {
  var bestCoord = {x:undefined,y:undefined,score:Infinity},dCoord={x:0,y:0,score:0};
  var m=cobj.m,n=cobj.n
  var ds = 0, mul=(cobj.pl=='x')?1:-1,x,y,matrix=cobj.matrix,plt = (cobj.pl=='x')?'o':'x',pl=cobj.pl
  bestCoord.score *= -mul

  for(var i=0;i<m*n;i++) {
    if(matrix[i] != '-') continue
    x=i%3
    y=~~(i/3)
    matrix[i]=pl
    if(hasWon(cobj)) {
      matrix[i]='-'
      bestCoord.x=x
      bestCoord.y=y
      bestCoord.score = mul*10
      break
    } else {
      cobj.pl=plt
      dCoord = findBestMove(cobj)
      cobj.pl=pl
      dCoord.x = x
      dCoord.y = y
      matrix[i]='-'
      if(mul==1 && dCoord.score > bestCoord.score || mul==-1 && dCoord.score < bestCoord.score) {
        bestCoord = JSON.parse(JSON.stringify(dCoord))
      }
    }
  }

  bestCoord.x *= cobj.canvas.width/3
  bestCoord.y *= cobj.canvas.height/3

  return bestCoord
}

function wrapText(ctx, str, x,y, max_width, line_height) {
  var sw = ctx.measureText(str)
  console.log('yoyo'+sw.width)
  if(sw.width > max_width) {
    var cw = sw.width/str.length
    var cc = str.lastIndexOf(' ',~~(max_width/cw))
    cc=(cc==-1)?str.length:cc
    var str1 = str.substr(cc+1)
    str = str.substr(0,cc)
    ctx.fillText(str,x,y,max_width)
    wrapText(ctx,str1,x,y+line_height,max_width,line_height)
  } else {
    ctx.fillText(str,x,y,max_width)
    console.log('yoyo'+max_width)
  }
}

function celebrate(cobj) {
  /**
  * A message will be shown to player
  * some animation on the background(not too flashy please)
  */
  var c=document.querySelector('canvas#celebrator')
  setCanvasDims(c)
  c.style = 'display: block'
  var winstr = cobj.pl.toUpperCase() + ' wins',ctx = c.getContext('2d')
  //if(cobj.aimode) winstr=winstr+'. \n'+mockUser()
  ctx.font = '2.5rem Serif'
  ctx.fillStyle = cobj.fgColor
  wrapText(ctx,winstr,c.width/4,c.height/2,c.width/2,100)
  //ctx.fillText(winstr,c.width/4,c.height/2,c.width/2)
  requestAnimationFrame(function f1() {
    spark(ctx,{x:Math.random()*c.width, y: Math.random()*c.height})
    if(cobj.init != -1) requestAnimationFrame(f1)
  })

  c.addEventListener('click',function() {
    c.style='display: none'
    cobj.canvas.style='display: none'
    document.querySelector('#mainmenu').style='display: block'
    toInitState(cobj)
    clearInterval(cobj.drawer1)
  })

  console.log("Congrats! "+winstr)
  cobj.init = 10
}

function mockUser() {
  var mlist = [
    "You did good. Maybe next time you'll beat me.",
    "Better luck next time.",
    "Give up. You can't beat me.",
    "You can't beat me however hard you try",
    "Loooserr!!"
  ]
  return mlist[~~(Math.random()*(mlist.length))]
}
