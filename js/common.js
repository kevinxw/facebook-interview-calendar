/**
 * Created by Kevin on 1/28/14.
 */

    // shallow copy
function extend($target, $options) {
    var name;
    for (name in $options) {
        if ($target === $options[name])
            continue;
        if ($options[name])
            $target[name] = $options[name];
    }
    return $target;
}

