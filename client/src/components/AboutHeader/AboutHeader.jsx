import image27 from '../../../public/image27.jpg'

const AltText = 'Swimmer Competing Against Other Teams During Their Relay';
const url = image27;
function AboutHeader () {
return (
<div>
<img src={url} alt={AltText} style={{width:"100%", height:"600px"}}/>
<h1 style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, color: 'white' }}>About Us</h1>
</div>
    );
}

export default AboutHeader;