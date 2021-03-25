#!/bin/bash


# vars
source _env.sh


## Picasso
export modelinfo="Picasse v02 - iteration X"
export callport=9000
sleep 1

./__launch-call.sh
ls
sleep 1

## Kandinsky
export modelinfo="Kandinsky"
export callport=9001
./__launch-call.sh


## "Picasse v03 - iteration 165k
export modelinfo="Picasse v03 - iteration 165ik"
export callport=9002
./__launch-call.sh



## "Picasse v03 - iteration 30k
export modelinfo="Picasse v03 - iteration 30k"
export callport=9003
./__launch-call.sh
