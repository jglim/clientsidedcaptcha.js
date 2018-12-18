class clientsidedcaptcha {

    // TODO: prefix all ids to allow multiple instances
    constructor(captchaOptions)
    {
        // unfortunately this is here as a hack to get around the async onload
        this.currentCaptchaData = captchaOptions
        this.createCaptchaElements();
        this.prepareGrid();
        this.bindEvents();
    }

    bindEvents()
    {
        let captchaBtnVerify = document.getElementById("captchaBtnVerify");
        captchaBtnVerify.addEventListener("click", function(){
            let captchaResponse = clientsidedcaptcha.verifyCaptcha();
            if (captchaResponse)
            {
                document.getElementById("captchaErrorLabel").style.display = "none";
            }
            else
            {
                document.getElementById("captchaErrorLabel").style.display = "block";
            }
            //console.log(captchaResponse);
        });
        let captchaBtnRequest = document.getElementById("captchaBtnRequest");
        captchaBtnRequest.addEventListener("click", function(){
            alert("Unfortunately, no other captchas are available at the moment.");
        });
    }

    generateGrid()
    {
        let captchaDefinition = this.currentCaptchaData;

        let gridWidth =  Math.sqrt(captchaDefinition.answerGrid.length);
        let gridTotalWidth = 400;
        let gridWidthPx = gridTotalWidth / gridWidth;
        let cssPercentage = 100 / gridWidth;
        let gridTemplateCss = "";

        for (let i = 0; i < gridWidth; i++)
        {
            gridTemplateCss += cssPercentage + "% ";
        }

        document.getElementById("captchaTextIntro").innerText = captchaDefinition.textIntro;
        document.getElementById("captchaTextSubject").innerText = captchaDefinition.textSubject;

        let canvas = document.getElementById("captchaCanvas");
        let ctx = canvas.getContext("2d");
        canvas.width = gridWidthPx;
        canvas.height = gridWidthPx;
        let captchaImageForCopy = document.getElementById("captchaImgForCopy");

        let captchaContainer = document.getElementById("captchaContent");
        captchaContainer.innerHTML = "";
        captchaContainer.style.gridTemplateRows = gridTemplateCss;
        captchaContainer.style.gridTemplateColumns = gridTemplateCss;

        for (let i = 0; i < captchaDefinition.answerGrid.length; i++)
        {
            let gridRowValue = (i % gridWidth) + 1;
            let gridColValue = Math.floor(i / gridWidth) + 1;
            let captchaCell = document.createElement("img");

            ctx.drawImage(captchaImageForCopy, gridWidthPx * (gridRowValue - 1), gridWidthPx * (gridColValue - 1), gridWidthPx, gridWidthPx, 0, 0, gridWidthPx, gridWidthPx);

            captchaCell.src = canvas.toDataURL();
            captchaCell.classList.add("captchaCell");
            captchaCell.style.gridRow = gridColValue;
            captchaCell.style.gridColumn = gridRowValue;
            captchaCell.setAttribute("data-answer", captchaDefinition.answerGrid[i]);
            captchaCell.addEventListener("click", function(){
                const cellActiveClassName = "captchaCellActive";

                if (this.classList.contains(cellActiveClassName))
                {
                    this.classList.remove(cellActiveClassName);
                }
                else
                {
                    this.classList.add(cellActiveClassName);
                }
            });

            captchaContainer.appendChild(captchaCell);
        }
    }

    prepareGrid()
    {
        let captchaImageForCopy = document.getElementById("captchaImgForCopy");
        // sigh asynchronous onload
        captchaImageForCopy.src = this.currentCaptchaData.image;
        let self = this;
        captchaImageForCopy.onload = function(){ self.generateGrid(this.currentCaptchaData); }
    }

    static verifyCaptcha()
    {
        let cellsToCheck = document.getElementsByClassName("captchaCell");
        for (let i = 0; i < cellsToCheck.length; i++)
        {
            let cellIsSelected = cellsToCheck[i].classList.contains("captchaCellActive");
            let cellIsCorrect = cellsToCheck[i].getAttribute("data-answer");
            if (cellIsCorrect === "1" && cellIsSelected === false)
            {
                return false;
            }
            if (cellIsCorrect === "0" && cellIsSelected === true)
            {
                return false;
            }
        }

        let opacityTransitionTarget = document.getElementById("captchaParent");
        opacityTransitionTarget.style.opacity = "0";

        let parentInputValue = document.querySelectorAll('[data-callback]');
        if (parentInputValue.length !== 0)
        {
            parentInputValue[0].setAttribute("data-verified", true);
            setTimeout(function()
            {
                let opacityTransitionTarget = document.getElementById("captchaParent");
                opacityTransitionTarget.style.display = "none";
                let callbackName = (document.querySelectorAll('[data-callback]')[0]).getAttribute("data-callback") + "();";

                // FIXME: is there a better way than eval()?
                eval(callbackName);
            }, 200);
        }


        return true;
    }

    execute()
    {
        let opacityTransitionTarget = document.getElementById("captchaParent");
        opacityTransitionTarget.style.display = "block";
        // does not animate otherwise
        setTimeout(function()
        {
            let opacityTransitionTarget = document.getElementById("captchaParent");
            opacityTransitionTarget.style.opacity = "1";
        
        }, 20);

    }

    // maybe this should be in a separate module and the bundler can sort it out
    createCaptchaElements()
    {
        let pageTemplate = `
            <div id="captchaParent" style="opacity: 0; display: none;">
              <div id="captchaDesc">
                <span id="captchaTextIntro"></span>
                <span id="captchaTextSubject"></span>
              </div>
              <div id="captchaContent"></div>
              <div id="captchaVerifyBar">
                <div id="captchaErrorLabel" style="display: none;">Consult your local GP<br/>You may be a robot</div>
                <a href="#" id="captchaBtnRequest" title="Get a new challenge" class="captchaButton"></a>
                <a href="https://github.com/jglim/clientsidedcaptcha.js" target="_blank" id="captchaBtnInfo" title="Help" class="captchaButton"></a>
                <a href="#" id="captchaBtnVerify">Verify</a>
              </div>
        
              <div id="captchaHelperInvisible">
                <canvas id="captchaCanvas"></canvas>
                <img id="captchaImgForCopy"/>
              </div>
            </div>
        `;

        let pageCss = `
#captchaParent
{
    width: 400px;
    min-height: 400px;
    border: 1px solid #ddd;
    /* font-family: Roboto,helvetica,arial,sans-serif; */
    font-family: sans-serif;
    position: absolute;
    background-color: #fff;
    transition: opacity 0.2s;
    box-shadow: 0px 0px 0px 10000px rgba(255,255,255,0.5);
    top: 20%;
}


#captchaDesc
{
    background-color: #4a90e2;
    padding: 24px;
    color: white;
    margin: 5px;
}

#captchaTextSubject
{
    font-size: 24px;
    font-weight: 800;
    display: block;
    letter-spacing: -1px;
}

#captchaVerifyBar
{
    height: 60px;
    padding-left: 10px;

}

#captchaBtnVerify
{
    background-color: rgb(74, 144, 226);
    text-transform: uppercase;
    color: white;
    text-decoration: none;
    text-align: center;
    padding: 12px 24px;
    display: inline-block;
    font-weight: bold;
    border-radius: 2px;
    cursor: pointer;
    float: right;
    font-size: 0.9em;
    margin: 10px;
}

.captchaButton
{
    display: inline-block;
    width: 30px;
    height: 30px;
    margin: 15px 10px;
    background: no-repeat center;
    background-size: 100% auto;
    opacity: 0.5;
}

.captchaButton:hover
{
    opacity: 1;
}

#captchaBtnRequest
{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAwklEQVR4Ad3SNUKdYRCF4Sfa/VWsSh+r4tolQTaFu7tDySZgEXhHi7vrUGIfUt932jN+5CQftJi2bdu0Fu8BxZI81eFEXIhjrZ4oFhI8MSqc6vVdJvPDkBBmRTqhVZj3z0UK7Yh0wlvHTq/IKRbpBBqEvrQ8nTAufE/L0wnrQuae3D8hPVKa9NIpBoWy+56VL07se3Xfx32yItRI8sSIcKrPd5nn/hh0JAx7II2n2q+Yb0+1p3fZu9m0LTtmtHotBzkDHr1hLsMTaj0AAAAASUVORK5CYII=');
}

#captchaBtnInfo
{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAABCklEQVQ4Eb3BwUkjYQAG0Dc5zFSiaBGLbAuCoihePExQi1EI2IOipUiwAGVQWzAml29v//yrIUff47d1zjwarKwMHpzqbHDkQ0RERMS7Q2tN3Ip40tvSam2bmouYmfjhVnw6979GbyFmvjkSn/5YZ89CHKh0PsS5UcRoKt60ijPxpBYxaszFieJR9Da5EPeKQWzZZEe8KlaiVYuodWKpWIlWLaLWiaViENtqEbVd8aJ4EFO1iNqVuFOcirnGKGLUeBbHis676I0iRpdi0KocioU96/z1JfZ9MxMLvUatcelL3PhhYiZi7sKOTmfXlWcR1ybWOvAmIiIiYrBvg9aJe6+Wll7cOdb6Zf8AqWKAi4AvhYsAAAAASUVORK5CYII=');
}

#captchaContent
{
    height: 400px;
    width: 400px;
    background-color: #fff;
    border-bottom: 1px solid #ddd;
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    grid-template-rows: 25% 25% 25% 25%;
}

.captchaCell
{
    background-color: #eee;
    display: inline-block;

    grid-row: 2;
    grid-column: 2;
    cursor: pointer;
    width: calc(100% - 10px);
    height: calc(100% - 10px);
    margin: 5px;
    transition: width 0.2s, height 0.2s, margin 0.2s;
    user-drag: none; 
    user-select: none;
}

.captchaCellActive
{
    width: calc(100% - 40px);
    height: calc(100% - 40px);
    margin: 20px;
}

.captchaCellActive:after
{
    width: 30px;
    height: 30px;
    border-radius: 30px;
    background-color: #4a90e2;
    top: 0;
    left: 0;
    display: block;
}

#captchaImgForCopy
{
    width: 400px;
    height: 400px;
}

#captchaHelperInvisible
{
    display: none;
}

#captchaErrorLabel
{
    color: #ff0000;
    position: absolute;
    margin-left: 150px;
    margin-top: 15px;
    font-size:  12px;
}
        `;

        let pageHead = document.getElementsByTagName("head")[0];
        pageHead.insertAdjacentHTML("beforeend", "<style>" + pageCss + "</style>");
        let inputTarget = document.querySelectorAll('[data-callback]');
        if (inputTarget.length !== 0)
        {
            inputTarget[0].insertAdjacentHTML("afterend", pageTemplate);
            inputTarget[0].addEventListener("click", function(event){
                event.preventDefault();
                let opacityTransitionTarget = document.getElementById("captchaParent");
                opacityTransitionTarget.style.display = "block";

                // does not animate otherwise
                setTimeout(function()
                {
                    let opacityTransitionTarget = document.getElementById("captchaParent");
                    opacityTransitionTarget.style.opacity = "1";
                
                }, 20);

            });
        }

    }

}
