#include <iostream>
#include "opencv2/opencv.hpp"
#include "openjs.hpp"

using namespace std;
using namespace cv;

const Size formatSize(450,500);

int main( int argc, char *argv[]) {
  Mat leftImg = imread("./testAssets/1L.jpg", 0);
  Mat rightImg = imread("./testAssets/1R.jpg", 0);

  resize(leftImg, leftImg, formatSize);
  resize(rightImg, rightImg, formatSize);

  namedWindow( "LeftImg", WINDOW_AUTOSIZE );
  moveWindow( "LeftImg", 0, 0);
  setMouseCallback("LeftImg", js::MouseCallBack, &leftImg);
  imshow("LeftImg",leftImg);

  namedWindow( "RightImg", WINDOW_AUTOSIZE );
  moveWindow( "RightImg", 500, 0);
  imshow("RightImg",rightImg);

  waitKey(0);
  return 0;
}
