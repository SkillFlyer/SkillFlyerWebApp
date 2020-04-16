import React, { Component } from "react";
import PropTypes from "prop-types";
import "./SubtopicCard.css";
import Textfit from "react-textfit"

class SubtopicCard extends Component {
  render() {
    return (
      <div>
        <div class="col-md-4 subtopic">
          <div class="card card-1">
            <div id="title-and-desc">
              <h3 className="subtopic-card-name">{this.props.name}</h3>
              <p className="subtopic-card-description">{this.props.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SubtopicCard.propTypes = {
  name: PropTypes.string,
  photoUrl: PropTypes.string,
  subtopicId: PropTypes.string,
  topicId: PropTypes.string,
  description: PropTypes.string,
};
export default SubtopicCard;
