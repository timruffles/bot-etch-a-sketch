package bot


struct MoveTo {
  x int
  y int
}
struct Command {
  path []MoveTo
}
struct BotState {
  x int
  y int
  queue []Command
}

func (s BotState) Move(x int, y int) {
  if(s.x == nil) {
    s.x = x
    s.y = y
  } else {
    xdiff := s.x - x
    ydiff := s.y - y
  }
}
