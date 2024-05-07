const image29 = '/assets/image29.jpg'

const AltText = 'Swimmer Competing Against Other Teams During Their Relay';
const url = image29;
function AboutHeader () {
return (
<div>
<img src={url} alt={AltText} style={{width:"100%", height:"400px"}}/>
</div>
    );
}

export default AboutHeader;
