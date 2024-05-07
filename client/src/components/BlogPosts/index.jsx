import React from 'react';
import Card from 'react-bootstrap/Card';
import { useQuery } from '@apollo/client';
import { QUERY_POSTS } from '../../utils/queries';
import "../GenPageSetUp/index.css";
import GeneralImagery from '../ImageAltConfig/ImageAltConfigGen';
import shuffle from '../../utils/shuffle';

function BlogPosts() {
  const { loading, data } = useQuery(QUERY_POSTS);
  const posts = data?.posts;

  if (loading) return <p>loading...</p>;

  // randomize order of image array
  const shuffledImages = shuffle(GeneralImagery);

  return (
    <div id="blogPostsContainer" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
      {posts.map((post, index) => {
        // use modulo operator to repeat array if necessary
        const randomImage = shuffledImages[index % shuffledImages.length];
        return (
          <div key={post._id} style={{ width: "25%", margin: "30px" }}>
            <Card style={{ width: "24rem", height: "38rem" }}>
              <Card.Img variant="top" src={randomImage.url} alt={randomImage.alt} style={{ height: "200px" }} />
              <Card.Body style={{ padding: "10px" }} id="hello">
                <Card.Title style={{ textDecoration: "strong", color: "#6f499d", marginLeft: "10px", marginTop: "5px", marginBottom: "5px", marginRight: "10px" }}>{post.title}</Card.Title>
                <Card.Text style={{ marginLeft: "10px", marginTop: "10px", marginBottom: "5px", marginRight: "10px" }}>{post.content}</Card.Text>
              </Card.Body>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

export default BlogPosts;
