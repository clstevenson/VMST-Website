import BlogPosts from '../components/BlogPosts/index';
import HomeCarousel from '../components/HomeCarousel/HomeCarousel'
import AddPosts from '../components/AddPosts';
import "../components/GenPageSetUp/index.css";

function Home() {
  return (
    <>
      <div id='Welcome-To-VSMT'>
        <HomeCarousel />
      </div>
      <div id="blogPosts" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div>
          <h3 style={{ color: "white", padding: "10px", marginTop: "10px" }}>Welcome from the Virginia Masters Swim Team!</h3>
        </div>
        <BlogPosts />
      </div>
      {/* Comment AddPosts out before Demo */}
      <div id="addPosts">
        <AddPosts />
      </div>
    </>
  );
}

export default Home;
