const image29 = "./src/assets/photos/image29.jpg";

const altText = "VMST swimmer diving off the blocks";
const url = image29;
function AboutHeader() {
  return (
    <div>
      <img
        src={url}
        alt={altText}
        style={{ width: "100%", height: "400px", objectFit: "cover" }}
      />
    </div>
  );
}

export default AboutHeader;
