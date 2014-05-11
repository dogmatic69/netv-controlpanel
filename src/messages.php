<?php
	echo json_encode(array(
		'status' => 1,
		'title' => 'Awesome title',
		'message' => 'This is a cool message',
		'id' => rand(1, 100),
		'retry' => 10000,
	));