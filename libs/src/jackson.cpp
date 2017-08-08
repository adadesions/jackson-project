#include <iostream>
#include "opencv2/opencv.hpp"

using namespace std;
using namespace cv;

const Size formatSize(450,500);

void MouseCallBack(int event, int x, int y, int flags, void *param){
  Mat *source = (Mat*)param;
  Mat img = source->clone();
  Point c(x,y);
  int dimension = 21;

  if( dimension % 2 == 0 ){
    dimension = dimension + 1;
  }
  int stepBack = (dimension - 1)/2;

  if( event == EVENT_LBUTTONDOWN ){
    Point p0( c.x - stepBack, c.y - stepBack);
    Rect roi(p0, Size(dimension, dimension));
    Mat crop = img(roi);
    imshow("Crop", crop);
  }
  else{
    return;
  }
}

int main( int argc, char *argv[]) {
  Mat leftImg = imread("./testAssets/1L.jpg", 0);
  Mat rightImg = imread("./testAssets/1R.jpg", 0);

  resize(leftImg, leftImg, formatSize);
  resize(rightImg, rightImg, formatSize);

  namedWindow( "LeftImg", WINDOW_AUTOSIZE );
  moveWindow( "LeftImg", 0, 0);
  setMouseCallback("LeftImg", MouseCallBack, &leftImg);
  imshow("LeftImg",leftImg);

  namedWindow( "RightImg", WINDOW_AUTOSIZE );
  moveWindow( "RightImg", 500, 0);
  imshow("RightImg",rightImg);

  waitKey(0);
  return 0;
}
