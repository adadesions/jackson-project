#include <iostream>
#include "opencv2/opencv.hpp"

namespace js {
  void MouseCallBack(int event, int x, int y, int flags, void *param){
    cv::Mat *source = (cv::Mat*)param;
    cv::Mat img = source->clone();
    cv::Point c(x,y);
    int dimension = 21;

    if( dimension % 2 == 0 ){
      dimension = dimension + 1;
    }
    int stepBack = (dimension - 1)/2;

    if( event == cv::EVENT_LBUTTONDOWN ){
      cv::Point p0( c.x - stepBack, c.y - stepBack);
      cv::Rect roi(p0, cv::Size(dimension, dimension));
      cv::Mat crop = img(roi);
      cv::imshow("Crop", crop);
    }
    else{
      return;
    }
  }
}
