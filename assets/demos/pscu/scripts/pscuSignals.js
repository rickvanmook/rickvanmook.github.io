var signals = {};

signals.progressLocked = new Signal();
signals.hideArrow = new Signal();
signals.startArrowTimer = new Signal();

signals.sectionUpdated = new Signal();
signals.windowResized = new Signal();
signals.atmSizeChanged = new Signal();
signals.progressUpdated = new Signal();

signals.scrollTouchStarted = new Signal();
signals.scrollTouchUpdated = new Signal();
signals.scrollTouchEnded = new Signal();

signals.infoTouchStarted = new Signal();
signals.infoTouchUpdated = new Signal();
signals.infoTouchEnded = new Signal();

signals.overlayTouchStarted = new Signal();
signals.overlayTouchUpdated = new Signal();
signals.overlayTouchEnded = new Signal();

signals.touchTapped = new Signal();
signals.render = new Signal();
signals.resetScrollTracking = new Signal();
signals.calculatorPageTrack = new Signal();
signals.scrollMouseWheelDelta = new Signal();
signals.infoMouseWheelDelta = new Signal();

signals.overlayUpdated = new Signal();

signals.calculatorProgressUpdate = new Signal();
signals.playProgress = new Signal();
signals.rewindProgress = new Signal();
signals.setAnimating = new Signal();
