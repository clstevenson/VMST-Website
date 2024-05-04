import BlogPosts from '../components/BlogPosts';
import AddPosts from '../components/AddPosts';
import "../components/GenPageSetUp/index.css";

function Home() {
  return <>
  <div id="together">
    <div className="formatpage" id="blogPosts">
      <BlogPosts />
    </div>
    <div id="addPosts">
      <AddPosts />
    </div>
  </div>
    
  </>
    
}

export default Home;
