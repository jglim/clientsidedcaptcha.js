# clientsidedcaptcha.js
_[from SuperSillyHack 2018](https://supersillyhackathon.sg/)_

**clientsidedcaptcha.js** is a modern client-sided CAPTCHA.

![Demo](https://raw.github.com/jglim/clientsidedcaptcha.js/master/demo.gif)

**Key Features**
  - Easy setup! See below..
  - Customizable "ReCAPTCHA"-style captcha content
  - Self-contained 11KB JS file, no external scripts or resources
  - No backend required
  - Does not collect user data - _probably_ GDPR compliant

**Out of scope**
- Preventing bot access


---
# Usage
For most use cases, the first option is preferred. Only 4 steps!
### Automatically bind challenge to a button
Insert `clientsidedcaptcha.js` into your page
```
<script src="clientsidedcaptcha.js"></script>
```
Implement a callback that will be run after the CAPTCHA is completed.
```
function formSubmit(){
  console.log("Form was successfully submitted");
  document.getElementById("your-form").submit();
}
```
Attach the callback by adding a `data-callback` to the challenge button. 
```
<button type="submit" data-callback="formSubmit">Submit</button>
```
Initialize with your desired CAPTCHA options
_For examples, load `examples.js` with options for `mines`, `csstest`, `waldo`, `trafficlight` and `sponsors`_
```
let captcha = new clientsidedcaptcha(examples["mines"]);
```
Done! When the button is pressed, the CAPTCHA will appear with your specified options, and runs your callback upon completion.
### Programmatically invoke the challenge
Same steps as above, but use an invisible `input`
```
<input type="hidden" data-callback="formSubmit"/>
```
To invoke the challenge, use `execute`
```
captcha.execute();
```
# Designing your own CAPTCHAs
```
const captchaOptions =
{
    image: "data:image/png;base64,",
    textIntro: "Select squares containing elements that cannot accept",
    textSubject: "css pseudo-elements",
    answerGrid: [
        0, 0,
        0, 1
    ]
};
```
|Property|Description|
|-|-|
|`textIntro` | Introductory blurb (smaller font, on top)|
|`textSubject` | Describes the squares to click (below `textIntro`, larger and in bold) |
| `image` | (400px  × 400px) base64 data or link that is valid in the `src` attribute of an `<img>` tag. The `image` will be automatically segmented based on `answerGrid` |
| `answerGrid` | 1-dimension array that describes the correct squares to check, where `1` indicates a checked square, `0` indicates an unchecked square. The square root of items in `answerGrid` should be a whole number (i.e. `answerGrid` should contain 1/4/9/16/25/36/49/64/81/100.. items) |

Take a look at `examples.js` for more examples.

---
# Why?

A while ago, I encountered [this](https://twitter.com/jg_lim/status/1027378276342231042) and thought that I could improve on it.

![OM](https://raw.github.com/jglim/clientsidedcaptcha.js/master/omcaptcha.gif)

_"hackathon-grade" code quality (at SuperSillyHack 2018) - this might be buggy_

Please _try_ not to use it in production, though if you do, I would be glad to hear about it :^)

[@jg_lim](https://twitter.com/jg_lim)


