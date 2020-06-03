import { getAllSubtopics } from "../../actions/subtopicActions";
import { connect } from "react-redux";
import React, { Component } from "react";
import PropTypes from "prop-types";
import SubtopicCard from "../cards/SubtopicCard";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import noSubtopicsPlaceholder from "./assets/no-subtopics.png";
import "./SubtopicGrid.css";
import Container from "@material-ui/core/Container"

class SubtopicGrid extends Component {
  componentDidMount() {
    const topicName = this.props.match.params.topicName;
    this.props.getAllSubtopics(topicName);
  }
  render() {
    const { subtopics } = this.props.subtopics;
    if (subtopics.length > 0) {
      return (
        <div id="subtopic-grid-body">
          <Grid id="subtopic-grid-container" container spacing={10}>
            {subtopics.map((subtopic) => (
              <Grid
                className="subtopic-card-grid-item"
                key={subtopic._id}
                item
                xs
              >
                <Container className = "subtopic-card-container">
                <Link
                  to={`/dashboard/${this.props.match.params.topicName}/${subtopic.subtopic_name}`}
                >
                  <SubtopicCard
                    name={subtopic.subtopic_name}
                    photoUrl={subtopic.photo_url}
                    description={subtopic.description}
                  />
                </Link>
                </Container>
              </Grid>
            ))}
          </Grid>
        </div>
      );
    } else {
      return (
        <div className="no-subtopics-message">
          <img src={noSubtopicsPlaceholder} alt="no-subtopics" />
          <h1>No Subtopics Under {this.props.match.params.topicName}</h1>
          <p>Check back later to study this new subtopic!</p>
        </div>
      );
    }
  }
}

SubtopicGrid.propTypes = {
  auth: PropTypes.object.isRequired,
  getAllSubtopics: PropTypes.func.isRequired,
  subtopics: PropTypes.object.isRequired,
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  subtopics: state.subtopics,
});
export default connect(mapStateToProps, { getAllSubtopics })(SubtopicGrid);
