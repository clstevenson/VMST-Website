import Card from 'react-bootstrap/Card';
import { useQuery} from '@apollo/client';
import { QUERY_POSTS } from '../../utils/queries';
import "./index.css";

function BlogPosts() {
  const { loading, data, error }= useQuery(QUERY_POSTS);
  const posts = data?.posts;

  if (loading) return <p>loading...</p>
  return (
    (posts.map(post => 
      <div id="container" key={post._id}>
         <Card  style={{ width: '18rem' }}>
      <Card.Body id="hello">
        <Card.Title>{ post.title }</Card.Title>
        <Card.Text>
          { post.content }
        </Card.Text>
      </Card.Body>
      </Card>
      </div>
     
      ))
  );
}

export default BlogPosts;