--- a reducible model doesn't match anything, only *
--- ns is a native string

deduce: Model => Model => Model
deduce e (a /\ b) = (deduce e a) /\ (deduce e b)
deduce e (a \/ b) = (deduce e a) \/ (deduce e b)
deduce e (fail c m) /\ * = fail c m
deduce e _ /\ (fail c m) = fail c m
deduce e Success \/ * = Success
deduce e _ /\ Success = Success

deduce (a /\ b) x = (deduce a x) \/ (deduce b x)
deduce (a \/ b) x = (deduce a x) /\ (deduce b x)

deduce a (name ns) = lookup a (name ns)

deduce a b = equal a b


equal: Model => Model => Success \/ Failure
equal (name ns) (name ns) = Success
equal a b = fail 'NOT_EQUAL' (equal a b)

reflect: Model => Model => Model

--- `reflect m e` returns a term that, when deduced in `e`,
--- yields a model equal to `m`.
prove equal (deduce (reflect m e) e) m

